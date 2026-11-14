
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useEffect } from 'react'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'

import Home from './pages/Home'
import Contact from './pages/Contact'
import Services from './pages/Services'
import Books from './pages/Books'
import About from './pages/About'

import AdminLogin from './pages/AdminLogin'
import ForgotAdminPassword from './pages/ForgotAdminPassword'
import AdminDashboard from './pages/AdminDashboard'
import AdminEnquiries from './pages/AdminEnquiries'
import AdminBooks from './pages/AdminBooks'
import AdminAuthors from './pages/AdminAuthors'
import AdminProfile from './pages/AdminProfile'

import 'react-toastify/dist/ReactToastify.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

function NotFound() {
  return (
    <PublicLayout>
      <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-16">
        <h1 className="font-serif text-4xl text-text">
          Page not found
        </h1>

        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to Home
        </Link>
      </main>
    </PublicLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Public Website */}
        <Route
          path="/"
          element={<PublicLayout><Home /></PublicLayout>}
        />

        <Route
          path="/contact"
          element={<PublicLayout><Contact /></PublicLayout>}
        />

        <Route
          path="/services"
          element={<PublicLayout><Services /></PublicLayout>}
        />

        <Route
          path="/books"
          element={<PublicLayout><Books /></PublicLayout>}
        />

        <Route
          path="/about"
          element={<PublicLayout><About /></PublicLayout>}
        />

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/forgot-password"
          element={<ForgotAdminPassword />}
        />

        {/* Protected Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="authors" element={<AdminAuthors />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />
    </BrowserRouter>
  )
}
