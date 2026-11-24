'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Truck, CheckCircle2, Package, MapPin, ShieldCheck, Clock3 } from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import styles from './TrackOrder.module.css';

const timeline = [
	{ status: 'PROCESSING', title: 'Confirmed', description: 'Order received', icon: CheckCircle2 },
	{ status: 'PACKED', title: 'Packed', description: 'Prepared safely', icon: Package },
	{ status: 'SHIPPED', title: 'Shipped', description: 'Courier received', icon: Truck },
	{ status: 'DELIVERED', title: 'Delivered', description: 'Order delivered', icon: MapPin },
];

function TrackOrderContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialOrder = searchParams.get('orderNumber') || '';
	const [orderQuery, setOrderQuery] = useState(initialOrder);
	const [order, setOrder] = useState<any>(null);
	const [loading, setLoading] = useState(Boolean(initialOrder));
	const [error, setError] = useState('');

	async function loadOrder(orderNumber: string) {
		if (!orderNumber.trim()) return;
		setLoading(true);
		setError('');
		setOrder(null);
		try {
			const res = await fetch(`/api/orders/status?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
			const data = await res.json();
			if (res.status === 401) {
				router.replace(`/login?redirect=/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
				return;
			}
			if (!res.ok) throw new Error(data.error || 'Unable to find this order');
			setOrder(data.order);
		} catch (err: any) {
			setError(err.message || 'Unable to find this order');
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { if (initialOrder) loadOrder(initialOrder); }, [initialOrder]);

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		if (!orderQuery.trim()) return;
		router.push(`/track-order?orderNumber=${encodeURIComponent(orderQuery.trim())}`);
	}

	const trackingStatus = order?.shippingStatus;
	const statusIndex = trackingStatus === 'PACKED'
		? 1
		: trackingStatus === 'SHIPPED' || trackingStatus === 'OUT_FOR_DELIVERY'
			? 2
			: timeline.findIndex((step) => step.status === trackingStatus);

	return (
		<div className={styles.page}>
			<AnnouncementBar />
			<Navbar />
			<main className={styles.main}>
				<div className={styles.heading}>
					<div className={styles.headingText}>
						<p>Courier tracking</p>
						<h1>Track your order</h1>
					</div>
					<Link href="/account" className={styles.back}>
						<ArrowLeft size={15} />
						<span>My account</span>
					</Link>
				</div>

				<form className={styles.searchCard} onSubmit={handleSearch}>
					<label htmlFor="tracking-order">Order number</label>
					<div className={styles.searchRow}>
						<input
							id="tracking-order"
							className={styles.searchInput}
							value={orderQuery}
							onChange={(e) => setOrderQuery(e.target.value)}
							placeholder="Enter your REHAS order number"
						/>
						<button
							className={styles.searchButton}
							type="submit"
							disabled={loading || !orderQuery.trim()}
						>
							<Search size={17} /> Track order
						</button>
					</div>
				</form>

				{loading ? (
					<div className={styles.empty}>
						<Clock3 size={42} />
						<h2>Looking up your order</h2>
						<p>Please wait while we retrieve the latest courier status.</p>
					</div>
				) : error ? (
					<div className={styles.error}>
						<ShieldCheck size={42} />
						<h2>Order not found</h2>
						<p>{error}</p>
						<button className={styles.retry} onClick={() => setOrderQuery(initialOrder)}>
							Try again
						</button>
					</div>
				) : order ? (
					<div className={styles.contentGrid}>
						<section className={styles.timelineCard}>
							<div className={styles.cardHeader}>
								<h2>Order journey</h2>
								<span className={styles.statusBadge}>
									{order.shippingStatus?.replaceAll('_', ' ')}
								</span>
							</div>
							<div className={styles.timeline}>
								{timeline.map((step, index) => {
									const Icon = step.icon;
									const stepIndex = index;
									const complete = statusIndex < 0 ? index === 0 : stepIndex <= statusIndex;
									const active = statusIndex < 0 ? index === 0 : stepIndex === statusIndex;
									return (
										<div
											className={`${styles.step} ${complete ? styles.complete : ''} ${active ? styles.active : ''}`}
											key={step.status}
										>
											<div className={styles.stepIcon}>
												<Icon size={16} />
											</div>
											<strong>{step.title}</strong>
											<span>{step.description}</span>
										</div>
									);
								})}
							</div>
						</section>

						<aside className={styles.summaryCard}>
							<h2>Shipment details</h2>
							<div className={styles.summaryRows}>
								<div className={styles.summaryRow}>
									<span>Order</span>
									<strong>#{order.orderNumber}</strong>
								</div>
								<div className={styles.summaryRow}>
									<span>Courier</span>
									<strong>{order.trackingCourier || 'REHAS Express'}</strong>
								</div>
								<div className={styles.summaryRow}>
									<span>Tracking ID</span>
									<strong>{order.trackingNumber || 'Available after dispatch'}</strong>
								</div>
								<div className={styles.summaryRow}>
									<span>Payment</span>
									<strong>{order.paymentStatus}</strong>
								</div>
							</div>
						</aside>

						<div className={styles.productCard}>
							<div>
								<Link href="/account">View all orders</Link>
								<p>Updates are sent to your registered email address.</p>
							</div>
							<div className={styles.support}>
								<ShieldCheck size={15} /> Secure order information
							</div>
						</div>
					</div>
				) : (
					<div className={styles.empty}>
						<Package size={42} />
						<h2>Enter your order number</h2>
						<p>Use the order number from your confirmation email or account order history.</p>
					</div>
				)}
			</main>
			<Footer />
			<WhatsAppFloat />
		</div>
	);
}

export default function TrackOrderPage() {
	return <Suspense fallback={<div className={styles.page} />}><TrackOrderContent /></Suspense>;
}
