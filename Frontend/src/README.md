# 🚀 GitSentinel

**GitSentinel** is a smart tool that analyzes GitHub repositories to detect risky or suspicious activity in commits, contributors, and code patterns.

It helps developers and teams identify potential security issues early — before they become serious problems.

---

## 🔍 What It Does

* Scans a GitHub repository using basic inputs (owner, repo, branch)
* Analyzes recent commits and contributor activity
* Detects suspicious patterns like:

  * Secrets in code
  * Unusual commit behavior
  * Risky file changes
* Generates a simple and clear **risk score**
* Displays results in an interactive dashboard

---

## 🧠 Key Features

* 📊 **Commit Analysis** – Scan and evaluate recent commits
* ⚠️ **Suspicious Detection** – Identify high-risk changes
* 👥 **Contributor Insights** – Track contributor behavior
* 📈 **Risk Scoring** – Simple score to understand project safety
* 🖥️ **Modern Dashboard** – Clean UI with visual insights

---

## 🛠️ Tech Stack

* **Frontend:** Next.js, TypeScript, Tailwind CSS
* **State Management:** Zustand
* **Backend:** Node.js (API-based scanning system)

---

## 📦 Project Structure

```bash
src/
  app/            # Pages (Next.js routing)
  components/     # UI components
  services/       # API calls
  store/          # Global state (Zustand)
  utils/          # Helper functions
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/gitsentinel.git
cd gitsentinel
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 4. Run the development server

```bash
npm run dev
```

Open:
👉 http://localhost:3000

---

## 🔗 How It Works

1. User enters repository details
2. Frontend sends request to backend API
3. Backend scans commits and analyzes patterns
4. Results are returned and displayed on dashboard

---

## 📊 Example Output

* Total commits scanned
* Suspicious commits detected
* Risk score (Low / Medium / High)
* Detailed commit-level insights

---

## 🚀 Future Improvements

* Real-time monitoring of repositories
* More advanced detection models
* Team collaboration features
* Integration with CI/CD pipelines

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is for educational and hackathon purposes.

---

## ⭐ Final Note

GitSentinel aims to make repository analysis simple, fast, and useful — even for non-experts.

---
