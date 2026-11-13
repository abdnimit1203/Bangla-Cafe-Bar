import Image from "next/image";
import { ChipLink } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { loadCategories } from "@/lib/commerce/catalog";

export async function CategoryStrip() {
  const categories = await loadCategories();
  const roots = categories.filter((c) => !c.parent);
  if (!roots.length) return null;
  return (
    <nav aria-label="Food categories" className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ChipLink href="/menu">
        <Icon name="menu" size={14} className="text-gold" />
        Full menu
      </ChipLink>
      {roots.map((category) => (
        <ChipLink key={category.slug} href={`/menu?category=${encodeURIComponent(category.slug)}`}>
          {category.image?.url ? (
            <span className="relative h-6 w-6 overflow-hidden rounded-full">
              <Image src={category.image.url} alt="" fill sizes="24px" className="object-cover" />
            </span>
          ) : (
            <Icon name="utensils" size={14} className="text-gold" />
          )}
          {category.name}
        </ChipLink>
      ))}
    </nav>
  );
}
