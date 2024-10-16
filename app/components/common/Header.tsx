"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { UserRole } from "@prisma/client"; // Ensure UserRole is correctly imported
import { useRouter } from "next/navigation";
import { Menu, MenuItem, IconButton, Typography } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import React, { useState, MouseEvent } from "react";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // State for mobile menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="bg-gray-800 text-white py-4">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Miniverse Studios
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <Link href="/about" className="hover:text-gray-400">
              About
            </Link>
          </li>
          <li>
            <Link href="/gallery" className="hover:text-gray-400">
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/games" className="hover:text-gray-400">
              Games
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-gray-400">
              Contact
            </Link>
          </li>

          {session ? (
            <>
              {/* Profile Link */}
              <li>
                <Link href="/auth/profile" className="hover:text-gray-400">
                  Profile
                </Link>
              </li>

              {/* Admin Link (Visible Only to Admins) */}
              {session.user.role === UserRole.ADMIN && (
                <li>
                  <Link href="/admin/dashboard" className="hover:text-gray-400">
                    Admin
                  </Link>
                </li>
              )}

              {/* Logout Button */}
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:text-gray-400 focus:outline-none"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              {/* Sign In and Sign Up Links */}
              <li>
                <Link href="/auth/sign-in" className="hover:text-gray-400">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="hover:text-gray-400">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center">
          {session ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { handleMenuClose(); router.push("/auth/profile"); }}>
                  Profile
                </MenuItem>
                {session.user.role === UserRole.ADMIN && (
                  <MenuItem onClick={() => { handleMenuClose(); router.push("/admin/dashboard"); }}>
                    Admin
                  </MenuItem>
                )}
                <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={isMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { handleMenuClose(); router.push("/auth/sign-in"); }}>
                  Sign In
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); router.push("/auth/sign-up"); }}>
                  Sign Up
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
