// Sample catalog used only until Bitrefill credentials are added.
// Shown with a clear "demo" label; nothing here can be bought.
export const DEMO_PRODUCTS = [
  { id: 'demo-amazon-us', name: 'Amazon.com (US)', country: 'US', currency: 'USD', image: null, packages: [10, 25, 50, 100].map((v) => ({ id: `demo-amazon-us<&>${v}`, value: v })), range: null },
  { id: 'demo-uber-eats-us', name: 'Uber Eats (US)', country: 'US', currency: 'USD', image: null, packages: [15, 25, 50].map((v) => ({ id: `demo-uber-eats-us<&>${v}`, value: v })), range: null },
  { id: 'demo-steam-us', name: 'Steam (US)', country: 'US', currency: 'USD', image: null, packages: [20, 50, 100].map((v) => ({ id: `demo-steam-us<&>${v}`, value: v })), range: null },
  { id: 'demo-doordash-us', name: 'DoorDash (US)', country: 'US', currency: 'USD', image: null, packages: [], range: { min: 15, max: 200, step: 1 } },
  { id: 'demo-airbnb-us', name: 'Airbnb (US)', country: 'US', currency: 'USD', image: null, packages: [50, 100, 200].map((v) => ({ id: `demo-airbnb-us<&>${v}`, value: v })), range: null },
  { id: 'demo-playstation-us', name: 'PlayStation Store (US)', country: 'US', currency: 'USD', image: null, packages: [10, 25, 50].map((v) => ({ id: `demo-playstation-us<&>${v}`, value: v })), range: null },
];
