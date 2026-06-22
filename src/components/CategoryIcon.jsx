import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '../categories';

function CategoryIcon({ category, className = 'category-icon' }) {
  const { icon, color } = CATEGORY_ICONS[category] || DEFAULT_CATEGORY_ICON;
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ color }}>
      {icon}
    </span>
  );
}

export default CategoryIcon;
