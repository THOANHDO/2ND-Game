import { User, UserRole } from '../types';
import { StorageService } from './storage';

const USER_KEY = 'nintenstore_user';

export interface RegisterPayload {
  name: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  dob: string;
  city: string;
}

export const AuthService = {
  login: async (identifier: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock Logic for Demo
    // Check if it's the specific admin email
    const isAdmin = identifier === 'admin@ninten.com' && password === '123456';
    
    // Check against "Database" users for regular login
    const dbUsers = StorageService.getUsers();
    const foundUser = dbUsers.find(u => 
        (u.email === identifier || u.phoneNumber === identifier)
    );

    if (isAdmin) {
        const adminUser: User = {
            id: 'ADMIN_001',
            name: 'Super Admin',
            email: 'admin@ninten.com',
            role: 'ADMIN',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
        };
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
        return adminUser;
    }

    // Standard User Login Mock - For demo, we accept the hardcoded 'user@gmail.com' / '123456'
    // or any registered user if password matches (ignoring password check for this mock complexity level except checking if user exists)
    
    if (identifier === 'user@gmail.com' && password === '123456') {
         const demoUser: User = {
            id: 'USR-DEMO',
            name: 'Demo User',
            email: 'user@gmail.com',
            role: 'CUSTOMER',
            avatar: 'https://ui-avatars.com/api/?name=Demo&background=E60012&color=fff'
        };
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        return demoUser;
    }

    if (foundUser) {
        // In a real app, verify password here.
        localStorage.setItem(USER_KEY, JSON.stringify(foundUser));
        return foundUser;
    }

    throw new Error("Tài khoản hoặc mật khẩu không đúng");
  },

  // Step 1: Request OTP
  sendOTP: async (contact: string, method: 'EMAIL' | 'PHONE'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[MOCK OTP] Sending to ${method} ${contact}: ${otp}`);
    return otp; 
  },

  // Step 2: Verify OTP and Create Account
  verifyAndRegister: async (payload: RegisterPayload, otpCode: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otpCode.length !== 6) {
        throw new Error("Mã OTP không hợp lệ");
    }

    const newUser: User = {
      id: `USR-${Date.now()}`,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      name: payload.name,
      dob: payload.dob,
      city: payload.city,
      role: 'CUSTOMER', 
      createdAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${payload.name}&background=E60012&color=fff`
    };

    // Save to "Database" so Admin can see
    StorageService.addUser(newUser);

    // Set as current logged in session
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  updateProfile: async (updatedUser: User): Promise<User> => {
      // Update in DB
      StorageService.updateUser(updatedUser);
      // Update Session
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};