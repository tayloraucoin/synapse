import { PageFrame } from "@/components/page-frame";

import { CategoryList } from "./_components/category-list";
import { CategoryListHeader } from "./_components/category-list-header";

/**
 * CT-01 Categories.
 *
 * "Used for time-distribution reporting only, never for any mechanic"
 * (official spec §3.2) — which is why this screen is small and why deleting
 * from it is safe.
 */
export default function SettingsCategoriesPage() {
  return (
    <PageFrame header={<CategoryListHeader />}>
      <CategoryList />
    </PageFrame>
  );
}
