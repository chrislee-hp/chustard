import { v4 as uuidv4 } from 'uuid';

export class MenuService {
  constructor(categoryRepo, menuRepo, imageService) {
    this.categoryRepo = categoryRepo;
    this.menuRepo = menuRepo;
    this.imageService = imageService;
  }

  getMenus(storeId) {
    if (!storeId) throw new Error('VALIDATION_ERROR');
    const categories = this.categoryRepo.findByStoreId(storeId).map(cat => ({
      ...cat,
      nameKo: cat.name,
      nameEn: cat.name,
    }));
    const menus = categories.flatMap(cat => this.menuRepo.findByCategoryId(cat.id));

    // 이미지 없는 메뉴에 대해 백그라운드로 AI 이미지 생성
    if (this.imageService) {
      menus.filter(m => !m.imageUrl).forEach(m => {
        this.imageService.generateMenuImage(m.id, m.nameEn, m.descEn)
          .then(url => this.menuRepo.update(m.id, { imageUrl: url }))
          .catch(err => console.error(`Image generation failed for ${m.id}:`, err.message));
      });
    }

    return { categories, menus };
  }

  async createMenu({ nameKo, nameEn, descKo, descEn, price, categoryId, imageUrl }) {
    if (price < 1000 || price > 100000) throw new Error('VALIDATION_ERROR');
    if (!this.categoryRepo.findById(categoryId)) throw new Error('NOT_FOUND');
    if (imageUrl) await this.#validateImageUrl(imageUrl);

    return this.menuRepo.create({ id: uuidv4(), categoryId, nameKo, nameEn, descKo, descEn, price, imageUrl });
  }

  updateMenu(id, data) {
    if (!this.menuRepo.findById(id)) throw new Error('NOT_FOUND');
    if (data.price && (data.price < 1000 || data.price > 100000)) throw new Error('VALIDATION_ERROR');
    return this.menuRepo.update(id, data);
  }

  deleteMenu(id) {
    if (!this.menuRepo.findById(id)) throw new Error('NOT_FOUND');
    this.menuRepo.delete(id);
  }

  reorderMenus(menuIds) {
    this.menuRepo.reorder(menuIds);
  }

  createCategory(storeId, name) {
    return this.categoryRepo.create({ id: uuidv4(), storeId, name });
  }

  updateCategory(id, name) {
    if (!this.categoryRepo.findById(id)) throw new Error('NOT_FOUND');
    return this.categoryRepo.update(id, { name });
  }

  deleteCategory(id) {
    if (!this.categoryRepo.findById(id)) throw new Error('NOT_FOUND');
    if (this.menuRepo.countByCategoryId(id) > 0) throw new Error('CATEGORY_HAS_MENUS');
    this.categoryRepo.delete(id);
  }

  reorderCategories(categoryIds) {
    this.categoryRepo.reorder(categoryIds);
  }

  async #validateImageUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('INVALID_IMAGE_URL_FORMAT');
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('IMAGE_NOT_FOUND');
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('IMAGE_VALIDATION_TIMEOUT');
      if (err.message === 'IMAGE_NOT_FOUND') throw err;
      throw new Error('IMAGE_VALIDATION_FAILED');
    }
  }
}
