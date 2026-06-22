import CategoryIcon from './CategoryIcon';

function CategoryBadge({ gameMode, activeCategory }) {
  if (gameMode === 'ciegas') {
    return (
      <div className="category-badge category-badge--blind">
        <span className="material-symbols-outlined category-badge-icon">visibility_off</span>
      </div>
    );
  }

  return (
    <div className="category-badge">
      <CategoryIcon category={activeCategory || 'Marcas'} className="category-badge-icon" />
      Categoría: {activeCategory}
    </div>
  );
}

export default CategoryBadge;
