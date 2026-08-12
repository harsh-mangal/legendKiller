import {
  BadgePercent,
  Boxes,
  CircleGauge,
  Coins,
  FileText,
  FolderTree,
  Image,
  Inbox,
  MapPin,
  Package,
  PackageSearch,
  Quote,
  Settings2,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/", icon: CircleGauge }],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", path: "/orders", icon: ShoppingBag },
      { label: "Products", path: "/products", icon: Package },
      { label: "Inventory", path: "/inventory", icon: PackageSearch },
      { label: "Categories", path: "/categories", icon: FolderTree },
      { label: "Combos", path: "/combos", icon: Boxes },
      { label: "Coupons", path: "/promotions", icon: BadgePercent },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Reviews", path: "/reviews", icon: Star },
      { label: "Enquiries", path: "/enquiries", icon: Inbox },
    ],
  },
  {
    label: "Storefront",
    items: [
      { label: "Banners", path: "/banners", icon: Image },
      { label: "Testimonials", path: "/testimonials", icon: Quote },
      { label: "Articles", path: "/articles", icon: FileText },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Delivery & payments", path: "/delivery", icon: MapPin },
      { label: "Ameyka Coins", path: "/ameyka-coins", icon: Coins },
      { label: "Operations", path: "/operations", icon: Settings2 },
    ],
  },
];

export const routeTitles = Object.fromEntries(
  navigationGroups.flatMap((group) => group.items.map((item) => [item.path, item.label]))
);
