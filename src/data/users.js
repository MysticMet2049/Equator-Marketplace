export const MOCK_USERS = [
  {
    id: 1,
    name: "User X",
    email: "user@equator.com",
    password: "password123",
    phone: "(234) 342-9831",
    avatar: null,
    joinedAt: "2023-01-12",
    orders: [
      { id: "#92834", date: "12 Oct 2023", store: "Maison Atelier", status: "Livré",    total: 320 },
      { id: "#92711", date: "05 Oct 2023", store: "Lumina Lab",    status: "En cours", total: 155 },
      { id: "#92550", date: "22 Sep 2023", store: "Maison Atelier", status: "Livré",    total: 249 },
    ],
    storeAccounts: [
      { initials: "MA", name: "Maison Atelier", since: "12/01/2023" },
      { initials: "LL", name: "Lumina Lab",     since: "20/03/2023" },
    ],
  },
];