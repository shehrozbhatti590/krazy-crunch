// EDIT THIS FILE TO SET UP YOUR RESTAURANT
export const siteConfig = {
  name: "Krazy Crunch",
  tagline: "Itni Crunchy, Har Bite Karegi Baat!",

  // WhatsApp number that orders are sent to.
  // Format: country code + number, NO "+", NO spaces, NO dashes.
  // Example for Pakistan: 923001234567
  whatsappNumber: "923045576590",

  // Shown in footer / location section. Edit to your real address.
  address: "Shop 3, Ashraf Colony Dhamial Road, Rawalpindi, Punjab",
  city: "Rawalpindi",
  phoneDisplay: "0304 5576590",

  hours: [
    { day: "Monday", time: "12:00 PM - 3:00 AM" },
    { day: "Tuesday", time: "12:00 PM - 3:00 AM" },
    { day: "Wednesday", time: "12:00 PM - 3:00 AM" },
    { day: "Thursday", time: "12:00 PM - 3:00 AM" },
    { day: "Friday", time: "12:00 PM - 3:00 AM" },
    { day: "Saturday", time: "12:00 PM - 1:00 AM" },
    { day: "Sunday", time: "12:00 PM - 1:00 AM" },
  ],

  socials: {
    instagram: "https://instagram.com/krazycrunch",
    facebook: "https://facebook.com/krazycrunch",
  },

  currency: "Rs.",
  deliveryFee: 100,
  minOrderForFreeDelivery: 1500,
};
