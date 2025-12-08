import { User, IUser } from '../models/User';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/auth';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export class UserService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = new User({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      ambassadorTier: 'standard',
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

    // Remove password hash from response
    const userObj = user.toObject();
    delete (userObj as any).passwordHash;

    return {
      user: userObj as IUser,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Find user by email
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

    // Remove password hash from response
    const userObj = user.toObject();
    delete (userObj as any).passwordHash;

    return {
      user: userObj as IUser,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).select('-passwordHash');
    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: UpdateProfileData): Promise<IUser | null> {
    const updateData: any = {};
    
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    return user;
  }

  /**
   * Verify user account
   */
  static async verifyUser(userId: string): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { verifiedAt: new Date() } },
      { new: true }
    ).select('-passwordHash');

    return user;
  }
}



