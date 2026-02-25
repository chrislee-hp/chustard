import { MenuService } from '../../src/services/menuService.js';

describe('MenuService', () => {
  let service;
  let mockCategoryRepo, mockMenuRepo;

  beforeEach(() => {
    mockCategoryRepo = {
      findByStoreId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      reorder: jest.fn()
    };
    mockMenuRepo = {
      findByCategoryId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      reorder: jest.fn(),
      countByCategoryId: jest.fn()
    };
    service = new MenuService(mockCategoryRepo, mockMenuRepo);
  });

  describe('getMenus', () => {
    it('should return categories with menus', () => {
      mockCategoryRepo.findByStoreId.mockReturnValue([{ id: 'cat-001', name: 'Main' }]);
      mockMenuRepo.findByCategoryId.mockReturnValue([{ id: 'menu-001', nameKo: '불고기' }]);

      const result = service.getMenus('store-001');
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].menus).toHaveLength(1);
    });
  });

  describe('createMenu', () => {
    it('should create menu with valid data', async () => {
      mockCategoryRepo.findById.mockReturnValue({ id: 'cat-001' });
      mockMenuRepo.create.mockReturnValue({ id: 'menu-001', nameKo: '불고기' });

      const result = await service.createMenu({
        nameKo: '불고기', nameEn: 'Bulgogi', price: 15000, categoryId: 'cat-001'
      });
      expect(result.id).toBe('menu-001');
    });

    it('should throw on invalid price', async () => {
      await expect(service.createMenu({ price: 500 })).rejects.toThrow('VALIDATION_ERROR');
    });

    it('should throw on invalid category', async () => {
      mockCategoryRepo.findById.mockReturnValue(null);
      await expect(service.createMenu({ price: 15000, categoryId: 'invalid' })).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('deleteCategory', () => {
    it('should delete empty category', () => {
      mockCategoryRepo.findById.mockReturnValue({ id: 'cat-001' });
      mockMenuRepo.countByCategoryId.mockReturnValue(0);

      service.deleteCategory('cat-001');
      expect(mockCategoryRepo.delete).toHaveBeenCalledWith('cat-001');
    });

    it('should throw if category has menus', () => {
      mockCategoryRepo.findById.mockReturnValue({ id: 'cat-001' });
      mockMenuRepo.countByCategoryId.mockReturnValue(1);

      expect(() => service.deleteCategory('cat-001')).toThrow('CATEGORY_HAS_MENUS');
    });
  });
});
