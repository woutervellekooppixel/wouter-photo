import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/dashboard", label: "Downloads" },
  { href: "/admin/galleries", label: "Galleries" },
];

export default function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2 -mb-px border-b-2 transition-colors duration-150 text-sm font-medium ${
            pathname && pathname.startsWith(tab.href)
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
