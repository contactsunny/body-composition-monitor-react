import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChartBarIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Reports",
    path: "/dashboard/reports",
    icon: ChartBarIcon,
    children: [
      {
        name: "Overview",
        path: "/dashboard/reports/overview",
        icon: ChartBarIcon,
      },
      { name: "Weight", path: "/dashboard/reports/weight", icon: ChartBarIcon },
      {
        name: "Body Fat",
        path: "/dashboard/reports/body-fat",
        icon: ChartBarIcon,
      },
      {
        name: "Muscle Mass",
        path: "/dashboard/reports/muscle-mass",
        icon: ChartBarIcon,
      },
      {
        name: "Custom Metrics",
        path: "/dashboard/reports/custom",
        icon: ChartBarIcon,
      },
    ],
  },
  // Settings removed
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const isMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  // Ensure the current section is expanded based on the active route
  // This runs when the route changes
  if (
    !expandedItems.includes("/dashboard/reports") &&
    location.pathname.startsWith("/dashboard/reports")
  ) {
    setExpandedItems((prev) => [...prev, "/dashboard/reports"]);
  }

  const NavItemComponent = ({
    item,
    level = 0,
  }: {
    item: NavItem;
    level?: number;
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isParentActive =
      hasChildren &&
      (location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/"));

    return (
      <div>
        <NavLink
          to={item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpand(item.path);
              return;
            }
            // Close sidebar on mobile after navigation to reduce extra tap
            if (isMobile()) {
              onClose();
            }
          }}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              level > 0 && "pl-8",
              hasChildren
                ? isParentActive
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                : isActive
                ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              !isOpen && "justify-center"
            )
          }
          end={!hasChildren}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {isOpen && (
            <>
              <span className="flex-1">{item.name}</span>
              {hasChildren && (
                <ChevronRightIcon
                  className={clsx(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              )}
            </>
          )}
        </NavLink>
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1">
            {item.children?.map((child) => (
              <NavItemComponent
                key={child.path}
                item={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className={clsx(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-16"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            {isOpen ? (
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                BCM
              </h1>
            ) : (
              <div className="w-full flex justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  BC
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 md:hidden"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
