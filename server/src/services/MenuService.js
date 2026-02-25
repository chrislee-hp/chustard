class MenuService {
  constructor(menuRepo, categoryRepo) { this.menuRepo = menuRepo; this.categoryRepo = categoryRepo; }

  getMenus(storeId) { return this.menuRepo.findAllByStoreGrouped(storeId); }

  createMenu(data) {
    if (!data.nameKo || !data.nameEn || !data.categoryId) throw new Error('VALIDATION_ERROR');
    if (!data.price || data.price < 100 || data.price > 1000000) throw new Error('VALIDATION_ERROR');
    const sortOrder = this.menuRepo.maxSortOrder(data.categoryId) + 1;
    return this.menuRepo.create({ ...data, sortOrder });
  }

  updateMenu(id, data) {
    if (!this.menuRepo.findById(id)) throw new Error('NOT_FOUND');
    return this.menuRepo.update(id, data);
  }

  deleteMenu(id) {
    if (!this.menuRepo.findById(id)) throw new Error('NOT_FOUND');
    this.menuRepo.delete(id);
  }

  reorderMenus(menuIds) {
    this.menuRepo.updateSortOrders(menuIds.map((id, i) => [id, i]));
  }

  createCategory(storeId, name, nameEn) { return this.categoryRepo.create({ storeId, name, nameEn }); }

  updateCategory(id, name, nameEn) {
    if (!this.categoryRepo.findById(id)) throw new Error('NOT_FOUND');
    return this.categoryRepo.update(id, { name, nameEn });
  }

  deleteCategory(id) {
    if (this.categoryRepo.countMenus(id) > 0) throw new Error('VALIDATION_ERROR');
    this.categoryRepo.delete(id);
  }

  reorderCategories(categoryIds) {
    this.categoryRepo.updateSortOrders(categoryIds.map((id, i) => [id, i]));
  }
}
module.exports = MenuService;
