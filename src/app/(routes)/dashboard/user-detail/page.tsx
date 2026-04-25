"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,

  UserCheck
} from "lucide-react";
import { getUserDetailForProfile, updateUser, UserProfile, UpdateUserPayload } from "./service/userDetailService";
import { getCurrentUser } from "@/helper/helper";


const UserDetailPage: React.FC = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "other"
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type }), 3000);
  };

  const fetchUserData = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.replace("/authentication");
        return;
      }

      const response = await getUserDetailForProfile();
      const userData = response.data || response;

      const profile: UserProfile = {
        id: userData._id || userData.id || currentUser.id,
        firstName: userData.firstName || currentUser.firstName || "",
        lastName: userData.lastName || currentUser.lastName || "",
        email: userData.email || currentUser.email || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth || "",
        gender: userData.gender || "other",
        profileImage: userData.avatarUrl || userData.profileImage || null,
        joinedDate: userData.createdAt || userData.joinedDate || new Date().toISOString(),
        role: userData.role || null
      };

      setUserProfile(profile);
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "other"
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      showNotification("Failed to load user data", "error");
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setEditForm({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        gender: userProfile.gender || "other"
      });
    }
  };

  const handleSave = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      showNotification("First and last name are required", "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(editForm);
      await fetchUserData();
      setIsEditing(false);
      showNotification("Profile updated successfully", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification(error instanceof Error ? error.message : "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Not specified";
    }
  };

  const getUserInitials = () => {
    if (!userProfile) return "U";
    const first = userProfile.firstName?.charAt(0) || "";
    const last = userProfile.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || "U";
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-yellow-50">
    

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: "", type: "success" })}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-gradient-to-br from-lime-400 to-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {userProfile.profileImage ? (
                      <Image
                        src={userProfile.profileImage}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span>{getUserInitials()}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <UserCheck className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  <p className="text-gray-600 text-lg">{userProfile.email}</p>
                  {userProfile.role && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-lime-100 text-lime-800 mt-2">
                      {userProfile.role.name}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={isEditing ? handleCancel : handleEdit}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-lime-100 text-lime-700 hover:bg-lime-200"
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Member since {formatDate(userProfile.joinedDate)}
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile.firstName || "Not specified"}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile.lastName || "Not specified"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {userProfile.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile.phone || "Not specified"}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {formatDate(userProfile.dateOfBirth || "")}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 capitalize">
                    {userProfile.gender === "other" ? "Prefer not to say" : userProfile.gender || "Not specified"}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-gradient-to-r from-lime-500 to-yellow-500 hover:from-lime-600 hover:to-yellow-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default UserDetailPage;