# ♻️ ALRA PLASTIC RECYCLING S.A. de C.V.

Comprehensive traceability and control system developed by **Neurovix** for **ALRA PLASTIC RECYCLING S.A. de C.V.** It allows for complete tracking of the recycling process—from **material receipt** to **sale or return to the customer**—through the use of **QR codes**, automated reports, and intelligent dashboards.

---

## 🎥 View app

[▶️ View video](https://xzeeudfqafydqizuqorm.supabase.co/storage/v1/object/public/lotes/video_welcome.mp4)

---

## 🚀 Main Features

### 🔹 Batch and Sub-Batch Tracking

- Create **batches** and **sub-batches** with **automatically generated QR codes**.

- Scan QR codes from the app to view batch or sub-batch information.

- Record key data: weight, material type, customer, status, and location.

- Hierarchical association between batches and sub-batches to maintain complete traceability.

### 🔹 Inventory Management

- Real-time material control with automatic updates based on movements.

- Classification by material type (PET, HDPE, LDPE, PP, etc.).

- Charts and statistics of total inventory and by material type.

- Automatic adjustments upon completion or reopening of batches.

### 🔹 User Administration

- Role-based system with permissions: **Administrator**, **Operator**.

- User registration, editing, suspension, and deletion.

- Secure authentication via **Supabase Auth (JWT)**.

### 🔹 Material and Customer Management

- Adding, editing, and deleting recyclable materials.

- Customer registration with sales, returns, and transaction history.

- Reports filtered by customer, material, or time period.

### 🔹 Dashboards and Analytics

- Main panel with **monthly and real-time** statistics:

- Batches in process 🏭

- Completed batches ✅

- Material processed ♻️

- Inventory charts 📊
- Clear visualization for operational decision-making.

### 🔹 Automated Reports

- **Batch Report:** Can be generated manually upon batch completion or whenever needed.

- **Inventory Report:** Between `date x` and `date y`.

- **Customer Report:** With totals, returns, and purchases.

- Export reports to PDF and automatic email delivery.

---

## 🧩 Technologies Used

| Component | Description |

-------------|-------------|

**Mobile Frontend** | React Native + Expo Go + NativeWind |

**Backend** | Supabase (Integrated Database and REST API) |

**Authentication** | Supabase Auth (email and password) |

**Storage** | Supabase Storage (reports and files) |

**Graphics** | `react-native-svg` |

**QR Codes** | `expo-camera` Libraries |

---

### 📱 General Project Structure

#### 📦 alrasystem

##### ┣ 📂 app/ # Main Screens (Dashboards, Batches, Inventory)

##### ┣ 📂 components/ # Reusable Components (Cards, Buttons, Inputs, etc.)

##### ┣ 📂 lib/ # Connections to Supabase, helpers, and business logic

##### ┣ 📂 assets/ # Icons, logos, images, fonts

##### ┣ 📂 providers/ # Supabase auth

##### ┣ 📂 constants/ # Icons and fonts

##### ┣ 📂 database/ # Database structure

##### ┗ 📜 README.md

---

## 📸 Screenshots

### 👥 Welcome Screen

> Role control, access, and secure authentication with Supabase Auth.

![Users Screenshot](./public/welcome.png)

---

### 🏠 Main Dashboard

> Monthly information on batches, sub-batches, inventory, and overall performance.

![Dashboard Screenshot](./public/index.png)

---

### 📦 Batches and Sub-batches

> Complete information on a batch with sub-batches (includes images).

![Batches Screenshot](./public/information.png)

---

### 🧾 Search

> Search for batches based on their name or ID.

![Reports Screenshot](./public/search.png)

---

### 🧱 Inventory

> Visualization of the current inventory and graphs for better understanding.

![Inventory Screenshot](./public/inventario.png)

---

## ⚙️ Installation and Execution

### Prerequisites

- Node.js v18+
- Expo CLI && EAS CLI
- Supabase account (with a configured project)
- Physical device or emulator with **Expo Go**

### Local Installation

```bash
# Clone the repository
git clone https://github.com/neurovix/alrasystem.git
cd alrasystem

# Install dependencies
npm install

# Configure environment variables
touch .env.local
# Edit the variables with your Supabase URL and API Key
🔑 Environment Variables (.env)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key

# Run the app
npx expo start
```

Then scan the QR code with Expo Go to run the application on your device.

📅 Upcoming improvements
🌐 Administrative web panel (integration with the mobile backend)
📊 Reports with advanced filters and smart statistics
📦 Integration with an industrial QR reader
🧠 AI for performance prediction and plant optimization
📲 Automatic push notifications for batch statuses

## 👨‍💻 Developed by

- Fernando A. Vazquez M. (Neurovix) Fullstack Developer
