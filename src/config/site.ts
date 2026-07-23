// EDIT THIS FILE TO SET UP YOUR RESTAURANT
export const siteConfig = {
  name: "Krazy Crunch",
  tagline: "Itni Crunchy, Har Bite Karegi Baat!",

  // WhatsApp number that orders are sent to.
  // Format: country code + number, NO "+", NO spaces, NO dashes.
  // Example for Pakistan: 923001234567
  whatsappNumber: "923045576590",

  // Shown in footer / location section. Edit to your real address.
  address: "Shop 12, Commercial Market, Bahria Town, Rawalpindi, Punjab",
  city: "Rawalpindi",
  phoneDisplay: "0304 5576590",

  hours: [
    { day: "Monday - Thursday", time: "12:00 PM - 12:00 AM" },
    { day: "Friday - Sunday", time: "12:00 PM - 1:00 AM" },
  ],

  socials: {
    instagram: "https://instagram.com/krazycrunch",
    facebook: "https://facebook.com/krazycrunch",
  },

  currency: "Rs.",
  deliveryFee: 100,
  minOrderForFreeDelivery: 1500,
};
