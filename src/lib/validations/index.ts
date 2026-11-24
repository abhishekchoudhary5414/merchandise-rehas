import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export const orderCreateSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
  flatBuilding: z.string().min(2, 'House/Flat is required'),
  streetArea: z.string().min(3, 'Street/Area is required'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pinCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Valid 6-digit Indian PIN code required'),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      wristSize: z.string().optional(),
    })
  ).min(1, 'Cart cannot be empty'),
});
