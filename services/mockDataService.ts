
import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  SupplierPriceRequest, PricingRule,
  SupplierPriceRequestItem, AppNotification, ChatMessage, OrderItem,
  Driver, Packer, RegistrationRequest, OnboardingFormTemplate,
  BusinessProfile, OrderIssue, Industry, ProductUnit
} from '../types';
import { triggerNativeSms } from './smsService';

/* Exported RoleIncentive interface for CustomerPortals */
export interface RoleIncentive {
  amount: number;
  weeks: number;
  activationDays: number;
  minSpendPerWeek: number;
  referrerBonusEnabled: boolean;
  referrerBonusAmount: number;
}

export interface MockCartItem {
    productId: string;
    productName: string;
    price: number;
    qty: number;
    imageUrl: string;
    unit: string;
}

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com' },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Lettuce', 'Eggplants'], activeBuyingInterests: ['Potatoes', 'Apples'], businessProfile: { isComplete: true } as any },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2', activeSellingInterests: ['Potatoes', 'Apples'], activeBuyingInterests: [], businessProfile: { isComplete: true } as any },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com', phone: '0412 345 678', industry: 'Cafe', smsNotificationsEnabled: true, favorites: ['p1', 'p2'], catalogProducts: ['p1', 'p2', 'p3', 'p4', 'p5'] },
  { id: 'u5', name: 'Gary Grocer', businessName: 'Local Corner Grocers', role: UserRole.GROCERY, email: 'gary@grocer.com', phone: '0411 222 333', industry: 'Grocery Store', smsNotificationsEnabled: true, catalogProducts: ['p1', 'p2', 'p3', 'p4'] },
  { id: 'rep1', name: 'Alex Johnson', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep1@pz.com', phone: '0400 111 222', commissionRate: 5.0 },
  { id: 'rep2', name: 'Sam Taylor', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep2@pz.com', phone: '0400 333 444', commissionRate: 5.0 },
];

export const INDUSTRIES: Industry[] = [
  'Cafe', 'Restaurant', 'Pub', 'Hotel', 'Sporting Club', 'RSL', 'Casino', 
  'Catering', 'Grocery Store', 'Airlines', 'School', 'Aged Care', 'Hospital'
];

class MockDataService {
  private users: User[] = [...USERS];
  private cart: MockCartItem[] = [];
  private cartListeners: ((cart: MockCartItem[]) => void)[] = [];

  private industryIncentives: Record<Industry, number> = {
    'Cafe': 10, 'Restaurant': 12, 'Pub': 8, 'Hotel': 15, 'Sporting Club': 5,
    'RSL': 7, 'Casino': 20, 'Catering': 10, 'Grocery Store': 10, 'Airlines': 25,
    'School': 5, 'Aged Care': 8, 'Hospital': 8
  };

  private roleIncentives: Record<string, RoleIncentive> = {
    [UserRole.FARMER]: { amount: 500, weeks: 4, activationDays: 7, minSpendPerWeek: 100, referrerBonusEnabled: true, referrerBonusAmount: 250 },
    [UserRole.WHOLESALER]: { amount: 1000, weeks: 8, activationDays: 14, minSpendPerWeek: 500, referrerBonusEnabled: true, referrerBonusAmount: 500 },
    [UserRole.CONSUMER]: { amount: 100, weeks: 2, activationDays: 3, minSpendPerWeek: 50, referrerBonusEnabled: true, referrerBonusAmount: 25 },
    [UserRole.GROCERY]: { amount: 250, weeks: 4, activationDays: 7, minSpendPerWeek: 150, referrerBonusEnabled: true, referrerBonusAmount: 100 },
  };

  private products: Product[] = [
    { id: 'p1', name: 'Roma Tomatoes', category: 'Vegetable', variety: 'Truss', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 4.50, co2SavingsPerKg: 1.2 },
    { id: 'p2', name: 'Iceberg Lettuce', category: 'Vegetable', variety: 'Crisp', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 1.20, co2SavingsPerKg: 0.8 },
    { id: 'p3', name: 'Apples', category: 'Fruit', variety: 'Pink Lady', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 3.80, co2SavingsPerKg: 1.5 },
    { id: 'p4', name: 'Black Eggplant', category: 'Vegetable', variety: 'Standard', imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 5.50, co2SavingsPerKg: 1.1 },
    { id: 'p5', name: 'Dutch Cream Potatoes', category: 'Vegetable', variety: 'Grade A', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 2.10, co2SavingsPerKg: 0.9 },
    { id: 'p-banana-cav', name: 'Cavendish Bananas', category: 'Fruit', variety: 'Cavendish', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ad9902537317?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 3.50, co2SavingsPerKg: 0.9 },
    { id: 'p-banana-lady', name: 'Lady Finger Bananas', category: 'Fruit', variety: 'Lady Finger', imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 5.80, co2SavingsPerKg: 0.7 },
  ];

  private inventory: InventoryItem[] = [
    { id: 'i1', lotNumber: 'PZ-LOT-1001', productId: 'p1', ownerId: 'u2', quantityKg: 30, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', warehouseLocation: 'Zone A-4', discountAfterDays: 3, discountPricePerKg: 3.00, logisticsPrice: 15.00 },
    { id: 'i2', lotNumber: 'PZ-LOT-1002', productId: 'p2', ownerId: 'u2', quantityKg: 80, expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date().toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland', warehouseLocation: 'Cold Room 1', logisticsPrice: 20.00 },
    { id: 'i3', lotNumber: 'PZ-LOT-1003', productId: 'p1', ownerId: 'u3', quantityKg: 500, expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', logisticsPrice: 40.00 },
  ];

  private orders: Order[] = [];
  private issues: OrderIssue[] = [];
  private notifications: AppNotification[] = [];
  private chatMessages: ChatMessage[] = [];
  private customers: Customer[] = [
    { id: 'u4', businessName: 'The Morning Cafe', contactName: 'Alice Consumer', category: 'Restaurant', industry: 'Cafe', commonProducts: 'Bananas, Potatoes, Lettuce', location: 'Richmond', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'alice@cafe.com', phone: '0412 345 678', pzMarkup: 15, assignedPzRepId: 'rep1', assignedPzRepName: 'Alex Johnson', assignedPortal: UserRole.CONSUMER, repCommissionRate: 5, commissionTotalOrders: 20, commissionStartOrder: 1 },
    { id: 'u5', businessName: 'Local Corner Grocers', contactName: 'Gary Grocer', category: 'Grocery', industry: 'Grocery Store', commonProducts: 'Everything', location: 'Fitzroy', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'gary@grocer.com', phone: '0411 222 333', pzMarkup: 12, assignedPzRepId: 'rep2', assignedPzRepName: 'Sam Taylor', assignedPortal: UserRole.GROCERY, repCommissionRate: 8, commissionTotalOrders: 10, commissionStartOrder: 1 },
    { id: 'c-demo-1', businessName: 'Urban Greens Deli', contactName: 'Mark S.', category: 'Deli', industry: 'Grocery Store', location: 'Adelaide', connectedSupplierId: 'u2' },
    { id: 'c-demo-2', businessName: 'Seaside Bistro', contactName: 'Elena V.', category: 'Restaurant', industry: 'Restaurant', location: 'Glenelg', connectedSupplierId: 'u2' },
    { id: 'c-demo-3', businessName: 'The Salad Project', contactName: 'Tom B.', category: 'Catering', industry: 'Catering', location: 'Burnside', connectedSupplierId: 'u2' },
  ];

  private drivers: Driver[] = [
    { id: 'dr-1', name: 'John Driver', email: 'john@fresh.com', phone: '0412 111 222', licenseNumber: 'VIC-9988', vehicleRegistration: 'PZ-VAN-1', vehicleType: 'Van', wholesalerId: 'u2', status: 'Active' },
    { id: 'dr-2', name: 'Mike Logistics', email: 'mike@fresh.com', phone: '0412 333 444', licenseNumber: 'VIC-7766', vehicleRegistration: 'PZ-TRUCK-1', vehicleType: 'Truck', wholesalerId: 'u2', status: 'Active' }
  ];
  private packers: Packer[] = [
    { id: 'pk-1', name: 'Sarah Packer', email: 'sarah.p@fresh.com', phone: '0422 555 666', wholesalerId: 'u2', status: 'Active' },
    { id: 'pk-2', name: 'Dave Warehouse', email: 'dave.w@fresh.com', phone: '0422 777 888', wholesalerId: 'u2', status: 'Active' }
  ];
  private registrationRequests: RegistrationRequest[] = [
      { id: 'reg1', businessName: 'Sunshine Cafe', name: 'John Doe', email: 'john@sunshine.com', requestedRole: UserRole.CONSUMER, status: 'Pending', submittedDate: new Date().toISOString() }
  ];
  private priceRequests: SupplierPriceRequest[] = [
      { 
        id: 'pr1', 
        supplierId: 'u2', 
        status: 'PENDING', 
        createdAt: new Date().toISOString(), 
        customerContext: 'New Bistro', 
        customerLocation: 'Sydney', 
        items: [
            { productId: 'p1', productName: 'Roma Tomatoes', qty: 100, invoicePrice: 5.50, targetPrice: 4.20 },
            { productId: 'p2', productName: 'Iceberg Lettuce', qty: 50, invoicePrice: 3.20, targetPrice: 2.10 },
            { productId: 'p4', productName: 'Black Eggplant', qty: 30, invoicePrice: 7.00, targetPrice: 5.50 }
        ] 
      }
  ];

  constructor() {
      this.generateDemoOrders();
  }

  private generateDemoOrders() {
      const now = new Date();
      this.orders.push({
          id: 'o-demo-pending', 
          buyerId: 'u4', 
          sellerId: 'u2', 
          items: [
            { productId: 'p1', quantityKg: 50, pricePerKg: 4.50, unit: 'KG' },
            { productId: 'p2', quantityKg: 20, pricePerKg: 3.20, unit: 'KG' }
          ], 
          totalAmount: 325.00, 
          status: 'Pending', 
          date: now.toISOString(), 
          source: 'Direct'
      });

      this.orders.push({
          id: 'o-demo-confirmed', 
          buyerId: 'u5', 
          sellerId: 'u2', 
          items: [
            { productId: 'p5', quantityKg: 100, pricePerKg: 2.10, unit: 'KG' }
          ], 
          totalAmount: 210.00, 
          status: 'Confirmed', 
          date: new Date(Date.now() - 3600000).toISOString(), 
          source: 'Direct'
      });

      this.orders.push({
          id: 'o-demo-shipped', 
          buyerId: 'c-demo-1', 
          sellerId: 'u2', 
          items: [
            { productId: 'p3', quantityKg: 40, pricePerKg: 3.80, unit: 'KG' }
          ], 
          totalAmount: 152.00, 
          status: 'Shipped', 
          date: new Date(Date.now() - 7200000).toISOString(), 
          source: 'Direct',
          logistics: { 
            driverName: 'John Driver',
            deliveryLocation: 'Adelaide Central', 
            deliveryTime: '14:30' 
          }
      });
  }

  getCart() { return this.cart; }
  
  addToCart(item: MockCartItem) {
      const existing = this.cart.find(i => i.productId === item.productId && i.unit === item.unit);
      if (existing) {
          existing.qty += item.qty;
      } else {
          this.cart.push(item);
      }
      this.notifyCartListeners();
  }

  updateCart(productId: string, qty: number) {
      if (qty <= 0) {
          this.cart = this.cart.filter(i => i.productId !== productId);
      } else {
          const item = this.cart.find(i => i.productId === productId);
          if (item) item.qty = qty;
      }
      this.notifyCartListeners();
  }

  clearCart() {
      this.cart = [];
      this.notifyCartListeners();
  }

  subscribeToCart(listener: (cart: MockCartItem[]) => void) {
      this.cartListeners.push(listener);
      listener(this.cart);
      return () => {
          this.cartListeners = this.cartListeners.filter(l => l !== listener);
      };
  }

  private notifyCartListeners() {
      this.cartListeners.forEach(l => l([...this.cart]));
  }

  getAllUsers() { return this.users; }
  getCustomers() { return this.customers; }
  getAllProducts() { return this.products; }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  getInventory(userId: string) { return this.inventory.filter(i => i.ownerId === userId); }
  getAllInventory() { return this.inventory; }
  getOrders(userId: string) { if (userId === 'u1') return this.orders; return this.orders.filter(o => o.buyerId === userId || o.sellerId === userId); }
  getAppNotifications(userId: string) { return this.notifications.filter(n => n.userId === userId); }
  getTodayIssues() { return this.issues; }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER); }
  getIndustryIncentives() { return this.industryIncentives; }
  getRoleIncentives() { return this.roleIncentives; }

  toggleFavorite(userId: string, productId: string) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
          if (!user.favorites) user.favorites = [];
          if (user.favorites.includes(productId)) {
              user.favorites = user.favorites.filter(id => id !== productId);
          } else {
              user.favorites.push(productId);
          }
      }
  }

  toggleCatalogProduct(userId: string, productId: string) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
          if (!user.catalogProducts) user.catalogProducts = [];
          if (user.catalogProducts.includes(productId)) {
              user.catalogProducts = user.catalogProducts.filter(id => id !== productId);
          } else {
              user.catalogProducts.push(productId);
          }
      }
  }

  createFullOrder(buyerId: string, items: OrderItem[], total: number) {
      const buyerProfile = this.customers.find(c => c.id === buyerId);
      const sellerId = buyerProfile?.connectedSupplierId || 'u2'; 
      const newOrder: Order = { id: `o-${Date.now()}`, buyerId, sellerId, items, totalAmount: total, status: 'Pending', date: new Date().toISOString(), paymentStatus: 'Unpaid', source: 'Direct' };
      this.orders.push(newOrder);
      return newOrder;
  }

  submitOrderIssue(orderId: string, issueData: any) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    const newIssue: OrderIssue = {
        id: `iss-${Date.now()}`,
        orderId: order.id,
        productId: issueData.productId,
        type: issueData.issueType,
        description: issueData.description || `Reported issue.`,
        reportedAt: new Date().toISOString(),
        supplierStatus: 'PENDING',
        repStatus: 'UNSEEN'
    };
    this.issues.push(newIssue);
    order.issue = newIssue;
  }

  manualProvision(data: any): string {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const userId = `u-manual-${Date.now()}`;
      const incentive = this.roleIncentives[data.role] || { amount: 0, weeks: 0 };
      const newUser: User = { id: userId, name: data.name, businessName: data.businessName, role: data.role, email: data.email, phone: data.mobile, loginCode: code, passwordSet: false, pendingBonus: incentive.amount, bonusVestingWeeks: incentive.weeks, bonusActivated: true };
      this.users.push(newUser);
      this.customers.push({ id: userId, businessName: data.businessName, contactName: data.name, email: data.email, phone: data.mobile, category: 'Manual Provision', connectionStatus: 'Pending Connection', assignedPortal: data.role });
      return code;
  }

  loginWithCode(code: string): User | null {
      const user = this.users.find(u => u.loginCode === code.toUpperCase());
      return user || null;
  }

  setUserPassword(userId: string, passwordReset: boolean) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
          user.passwordSet = true;
          user.loginCode = undefined;
      }
  }

  updateCustomerSupplier(customerId: string, supplierId: string) {
      const customer = this.customers.find(c => c.id === customerId);
      const supplier = this.users.find(u => u.id === supplierId);
      if (customer && supplier) {
          customer.connectedSupplierId = supplierId;
          customer.connectedSupplierName = supplier.businessName;
      }
  }

  updateCustomerPortal(customerId: string, portalRole: UserRole) {
      const customer = this.customers.find(c => c.id === customerId);
      if (customer) {
          customer.assignedPortal = portalRole;
      }
  }

  dispatchAccess(customerId: string): string {
      const customer = this.customers.find(c => c.id === customerId);
      if (!customer) return '';
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      customer.loginCode = code;
      let user = this.users.find(u => u.id === customer.id);
      if (!user) {
          user = { id: customer.id, name: customer.contactName, businessName: customer.businessName, role: customer.assignedPortal || UserRole.CONSUMER, email: customer.email || `${customer.id}@placeholder.com`, loginCode: code, passwordSet: false };
          this.users.push(user);
      } else {
          user.loginCode = code;
          user.role = customer.assignedPortal || user.role;
      }
      const incentive = this.roleIncentives[user.role] || { amount: 0, weeks: 0 };
      user.pendingBonus = incentive.amount;
      user.bonusVestingWeeks = incentive.weeks;
      user.bonusActivated = true;
      return code;
  }

  updateProductPrice(id: string, price: number) {
      const p = this.products.find(p => p.id === id);
      if (p) p.defaultPricePerKg = price;
  }

  acceptOrderV2(orderId: string) {
      const o = this.orders.find(o => o.id === orderId);
      if (o) o.status = 'Confirmed';
  }

  packOrder(orderId: string, packerName: string) {
      const o = this.orders.find(o => o.id === orderId);
      if (o) {
          o.status = 'Ready for Delivery';
          o.packedAt = new Date().toISOString();
      }
  }

  getSupplierPriceRequests(supplierId: string) {
      return this.priceRequests.filter(r => r.supplierId === supplierId);
  }

  getAllSupplierPriceRequests() {
      return this.priceRequests;
  }

  generateLotId() {
      return `PZ-LOT-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  addInventoryItem(item: InventoryItem) {
      this.inventory.push(item);
  }

  addProduct(product: Product) {
      this.products.push(product);
  }

  updateProductPricing(id: string, price: number, unit: ProductUnit) {
      const p = this.products.find(p => p.id === id);
      if (p) {
          p.defaultPricePerKg = price;
          p.unit = unit;
      }
  }

  updateCustomerRep(customerId: string, repId: string) {
      const c = this.customers.find(c => c.id === customerId);
      const rep = this.users.find(u => u.id === repId);
      if (c && rep) {
          c.assignedPzRepId = repId;
          c.assignedPzRepName = rep.name;
      }
  }

  updateCustomerMarkup(customerId: string, markup: number) {
      const c = this.customers.find(c => c.id === customerId);
      if (c) c.pzMarkup = markup;
  }

  getDrivers(wholesalerId: string) {
      return this.drivers.filter(d => d.wholesalerId === wholesalerId);
  }

  addDriver(driver: Driver) {
      this.drivers.push(driver);
  }

  getDriverOrders(driverId: string) {
      const driver = this.drivers.find(d => d.id === driverId);
      if (!driver) return [];
      return this.orders.filter(o => (o.status === 'Shipped' || o.status === 'Ready for Delivery') && o.logistics?.driverName === driver.name);
  }

  deliverOrder(orderId: string, driverName: string, photoUrl: string) {
      const o = this.orders.find(o => o.id === orderId);
      if (o) {
          o.status = 'Delivered';
          o.deliveredAt = new Date().toISOString();
          o.logistics = { ...o.logistics, driverName, deliveryPhoto: photoUrl };
      }
  }

  addEmployee(user: User) {
      this.users.push(user);
  }

  updateUserVersion(userId: string, version: 'v1' | 'v2') {
      const u = this.users.find(u => u.id === userId);
      if (u) u.dashboardVersion = version;
  }

  updateUserSmsPreference(userId: string, enabled: boolean, phone: string) {
      const u = this.users.find(u => u.id === userId);
      if (u) {
          u.smsNotificationsEnabled = enabled;
          u.phone = phone;
      }
  }

  getRegistrationRequests() {
      return this.registrationRequests;
  }

  approveRegistration(id: string) {
      const r = this.registrationRequests.find(r => r.id === id);
      if (r) r.status = 'Approved';
  }

  rejectRegistration(id: string) {
      const r = this.registrationRequests.find(r => r.id === id);
      if (r) r.status = 'Rejected';
  }

  updateIndustryIncentive(industry: Industry, value: number) {
      this.industryIncentives[industry] = value;
  }

  updateRoleIncentive(role: string, data: RoleIncentive) {
      this.roleIncentives[role] = data;
  }

  getRepCustomers(repId: string) {
      return this.customers.filter(c => c.assignedPzRepId === repId);
  }

  getRepIssues(repId: string) {
    return this.orders.filter(o => o.issue && o.issue.assignedRepId === repId);
  }

  getRepStats(repId: string) {
      const repOrders = this.orders.filter(o => {
          const customer = this.customers.find(c => c.id === o.buyerId);
          return customer?.assignedPzRepId === repId;
      });
      const totalSales = repOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const rep = this.users.find(u => u.id === repId);
      const commissionRate = rep?.commissionRate || 0;
      const commissionMade = repOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount * (commissionRate / 100), 0);
      const commissionComing = repOrders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + o.totalAmount * (commissionRate / 100), 0);
      return {
          totalSales,
          commissionMade,
          commissionComing,
          customerCount: this.getRepCustomers(repId).length,
          orders: repOrders
      };
  }

  findBuyersForProduct(productName: string) {
      return this.customers.filter(c => c.commonProducts?.toLowerCase().includes(productName.toLowerCase()));
  }

  createInstantOrder(buyerId: string, item: InventoryItem, qty: number, price: number) {
      const newOrder: Order = {
          id: `o-inst-${Date.now()}`,
          buyerId,
          sellerId: item.ownerId,
          items: [{ productId: item.productId, quantityKg: qty, pricePerKg: price }],
          totalAmount: qty * price,
          status: 'Confirmed',
          date: new Date().toISOString(),
          paymentStatus: 'Unpaid'
      };
      this.orders.push(newOrder);
      return newOrder;
  }

  addAppNotification(userId: string, title: string, message: string, type: string) {
      this.notifications.push({
          id: `n-${Date.now()}`,
          userId,
          title,
          message,
          type: type as any,
          timestamp: new Date().toISOString(),
          isRead: false
      });
  }

  createSupplierPriceRequest(request: SupplierPriceRequest) {
      this.priceRequests.push(request);
  }

  submitConsumerSignup(data: any) {
      this.registrationRequests.push({
          id: data.id || `reg-${Date.now()}`,
          businessName: data.businessName,
          name: data.name,
          email: data.email,
          requestedRole: data.requestedRole || UserRole.CONSUMER,
          status: 'Pending',
          submittedDate: new Date().toISOString(),
          consumerData: {
              location: data.location,
              weeklySpend: data.weeklySpend,
              orderFrequency: data.orderFrequency,
              invoiceFile: data.invoiceFile,
              mobile: data.mobile
          }
      });
  }

  onboardNewBusiness(data: any) {
      const newUser: User = {
          id: `u-${Date.now()}`,
          name: data.name || data.businessName,
          email: data.email,
          businessName: data.businessName,
          role: data.role || UserRole.WHOLESALER,
          phone: data.phone
      };
      this.users.push(newUser);
      return newUser;
  }

  deleteUser(id: string) {
      this.users = this.users.filter(u => u.id !== id);
  }

  finalizeDeal(reqId: string) {
      const req = this.priceRequests.find(r => r.id === reqId);
      if (req) {
          req.status = 'WON';
          const newCustomer: Customer = {
              id: `c-${Date.now()}`,
              businessName: req.customerContext,
              contactName: req.customerContext,
              category: 'Direct Lead',
              location: req.customerLocation,
              connectionStatus: 'Active',
              connectedSupplierId: req.supplierId,
              connectedSupplierName: this.users.find(u => u.id === req.supplierId)?.businessName || 'Supplier'
          };
          this.customers.push(newCustomer);
          return newCustomer;
      }
      return null;
  }

  sendOnboardingComms(customerId: string) {
      console.log('Sending onboarding comms to ' + customerId);
  }

  updateInventoryStatus(id: string, status: string) {
      const item = this.inventory.find(i => i.id === id);
      if (item) item.status = status as any;
  }

  sendChatMessage(senderId: string, receiverId: string, text: string) {
      const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId,
          receiverId,
          text,
          timestamp: new Date().toISOString()
      };
      this.chatMessages.push(newMessage);
  }

  getChatMessages(u1: string, u2: string) {
      return this.chatMessages.filter(m => 
          (m.senderId === u1 && m.receiverId === u2) ||
          (m.senderId === u2 && m.receiverId === u1)
      );
  }

  markNotificationAsRead(id: string) {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.isRead = true;
  }

  markAllNotificationsRead(userId: string) {
      this.notifications.filter(n => n.userId === userId).forEach(n => n.isRead = true);
  }

  createManualInvite(data: any) {
      const req: RegistrationRequest = {
          id: `reg-man-${Date.now()}`,
          businessName: data.businessName,
          name: data.name,
          email: data.email,
          requestedRole: data.role,
          status: 'Pending',
          submittedDate: new Date().toISOString(),
          paymentTerms: data.paymentTerms,
          customTerms: data.customTerms,
          consumerData: { mobile: data.mobile }
      };
      this.registrationRequests.push(req);
      return req;
  }

  uploadToDeli(data: any, businessName: string) {
      console.log('Uploading to Deli storefront for ' + businessName + ':', data);
  }

  updateUserInterests(userId: string, selling: string[], buying: string[]) {
      const u = this.users.find(u => u.id === userId);
      if (u) {
          u.activeSellingInterests = selling;
          u.activeBuyingInterests = buying;
      }
  }

  updateSupplierPriceRequestResponse(reqId: string, items: SupplierPriceRequestItem[]) {
      const req = this.priceRequests.find(r => r.id === reqId);
      if (req) {
          req.items = items;
          req.status = 'SUBMITTED';
      }
  }

  updateBusinessProfile(userId: string, profile: BusinessProfile) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.businessProfile = profile;
    }
  }

  getPackers(wholesalerId: string) {
    return this.packers.filter(p => p.wholesalerId === wholesalerId);
  }

  addPacker(packer: Packer) {
    this.packers.push(packer);
  }

  getPackerOrders(packerId: string) {
    const packer = this.packers.find(p => p.id === packerId);
    if (!packer) return [];
    return this.orders.filter(o => (o.status === 'Confirmed' || o.status === 'Pending') && o.sellerId === packer.wholesalerId);
  }

  updateOrderItems(orderId: string, items: OrderItem[]) {
      const o = this.orders.find(o => o.id === orderId);
      if (o) {
          o.items = items;
          o.totalAmount = items.reduce((sum, item) => sum + (item.quantityKg * (item.pricePerKg || 0)), 0);
          o.supplierCost = o.totalAmount * 0.85;
      }
  }

  sendDemandPing(senderId: string, receiverId: string, productId: string, qty: number, neededBy?: string) {
      const product = this.products.find(p => p.id === productId);
      const sender = this.users.find(u => u.id === senderId);
      const neededByText = neededBy ? ` by ${new Date(neededBy).toLocaleDateString()}` : '';
      this.addAppNotification(receiverId, 'URGENT STOCK INQUIRY', `${sender?.businessName} urgently needs ${qty}kg of ${product?.name}${neededByText}. Fulfill now?`, 'DEMAND_PING');
  }

  assignOrderToTeam(orderId: string, packerName: string, driverName: string) {
    const o = this.orders.find(o => o.id === orderId);
    if (o) {
      if (!o.logistics) o.logistics = {};
      o.logistics.driverName = driverName;
      if (o.status === 'Pending') o.status = 'Confirmed';
    }
  }
}

export const mockService = new MockDataService();
