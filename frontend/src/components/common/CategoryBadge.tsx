import styles from './CategoryBadge.module.css';

export type AgentCategory =
  | 'inventory-intelligence'
  | 'pricing-promotions'
  | 'store-operations'
  | 'customer-service-returns'
  | 'executive-insights';

interface CategoryBadgeProps {
  category: AgentCategory;
  size?: 'small' | 'medium';
}

const categoryLabels: Record<AgentCategory, string> = {
  'inventory-intelligence': 'Inventory Intelligence',
  'pricing-promotions': 'Pricing & Promotions',
  'store-operations': 'Store Operations',
  'customer-service-returns': 'Customer Service',
  'executive-insights': 'Executive Insights',
};

export function CategoryBadge({ category, size = 'medium' }: CategoryBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[category]} ${styles[size]}`}>
      {categoryLabels[category]}
    </span>
  );
}
