import React from 'react';
import {
  // Navigation & Actions
  Home,
  Users,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  
  // Communication
  Mail,
  Phone,
  MessageCircle,
  Send,
  
  // Business & CRM
  Building,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Users2,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Star,
  
  // Status & Alerts
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Bell,
  BellRing,
  
  // Data & Analytics
  PieChart,
  LineChart,
  Activity,
  Database,
  FileText,
  Folder,
  
  // UI Elements
  Menu,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  
  // Misc
  Globe,
  MapPin,
  Zap,
  Shield,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  ExternalLink,
  Link,
  Copy,
  Share,
  Heart,
  Bookmark,
  Flag,
  Tag,
  Hash,
  AtSign,
  Percent,
  Calculator,
  CreditCard,
  Wallet,
  ShoppingCart,
  Package,
  Truck,
  Plane,
  Car,
  Home as House,
  Building2,
  Factory,
  Store,
  Warehouse,
  
  // Property Types (for real estate CRM)
  Home as Apartment,
  Building as Office,
  Warehouse as Commercial,
  Factory as Industrial,
  Store as Retail,
  
  // Priority & Status
  Circle,
  Square,
  Triangle,
  Diamond,
  Hexagon,
  
  // Loading & Progress
  Loader,
  Loader2,
  RotateCw,
  
  // File & Document
  File,
  FileImage,
  
  // Social & Contact
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github,
  
} from 'lucide-react';

// Icon wrapper component with consistent styling
const Icon = ({ 
  icon: IconComponent, 
  size = 20, 
  color = 'currentColor',
  className = '',
  ...props 
}) => {
  return (
    <IconComponent 
      size={size} 
      color={color} 
      className={`inline-block ${className}`}
      {...props} 
    />
  );
};

// Pre-configured icon sets for different contexts
export const NavigationIcons = {
  dashboard: BarChart3,
  customers: Users,
  sales: TrendingUp,
  settings: Settings,
  home: Home,
  crm: Database,
};

export const ActionIcons = {
  add: Plus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  hide: EyeOff,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  save: Save,
  close: X,
  check: Check,
  refresh: RefreshCw,
  copy: Copy,
  share: Share,
  link: Link,
  external: ExternalLink,
  loading: Loader2,
};

export const StatusIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  alert: AlertCircle,
  notification: Bell,
  notificationActive: BellRing,
  loading: Loader2,
  pending: Clock,
};

export const BusinessIcons = {
  company: Building,
  user: User,
  users: Users2,
  briefcase: Briefcase,
  calendar: Calendar,
  money: DollarSign,
  target: Target,
  award: Award,
  star: Star,
  trending: TrendingUp,
  declining: TrendingDown,
  activity: Activity,
  shield: Shield,
};

export const ContactIcons = {
  email: Mail,
  phone: Phone,
  message: MessageCircle,
  send: Send,
  location: MapPin,
  globe: Globe,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  github: Github,
};

export const PropertyIcons = {
  apartment: Apartment,
  house: House,
  office: Office,
  commercial: Commercial,
  industrial: Industrial,
  retail: Retail,
  warehouse: Warehouse,
  building: Building2,
};

export const PriorityIcons = {
  high: Circle,
  medium: Square,
  low: Triangle,
  critical: Diamond,
  urgent: Hexagon,
};

export const ChartIcons = {
  pie: PieChart,
  line: LineChart,
  bar: BarChart3,
  activity: Activity,
};

export const FileIcons = {
  document: FileText,
  image: FileImage,
  text: FileText,
  folder: Folder,
  file: File,
};

export const UIIcons = {
  menu: Menu,
  moreHorizontal: MoreHorizontal,
  moreVertical: MoreVertical,
  grid: Grid,
  list: List,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
};

// Utility function to get icon by name
export const getIcon = (iconName, iconSet = 'action') => {
  const iconSets = {
    navigation: NavigationIcons,
    action: ActionIcons,
    status: StatusIcons,
    business: BusinessIcons,
    contact: ContactIcons,
    property: PropertyIcons,
    priority: PriorityIcons,
    chart: ChartIcons,
    file: FileIcons,
    ui: UIIcons,
  };

  const selectedSet = iconSets[iconSet] || ActionIcons;
  return selectedSet[iconName] || ActionIcons.check;
};

// Professional icon button component
export const IconButton = ({ 
  icon, 
  size = 'md',
  variant = 'ghost',
  color = 'gray',
  className = '',
  children,
  ...props 
}) => {
  const sizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4',
  };

  const variants = {
    ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    solid: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-600',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  };

  const IconComponent = typeof icon === 'string' ? getIcon(icon) : icon;

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {IconComponent && <IconComponent size={16} />}
      {children}
    </button>
  );
};

export { Icon };
export default Icon;
