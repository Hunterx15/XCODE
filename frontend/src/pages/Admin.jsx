import React, { useState } from "react";
import { Plus, Edit, Trash2, Video } from "lucide-react";
import { NavLink } from "react-router-dom";

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    {
      id: "create",
      title: "Create Problem",
      description: "Add a new coding problem to the platform",
      icon: Plus,
      color: "btn-success",
      route: "/admin/create",
    },
    {
      id: "update",
      title: "Update Problem",
      description: "Edit existing problems and their details",
      icon: Edit,
      color: "btn-warning",
      route: "/admin/update",
    },
    {
      id: "delete",
      title: "Delete Problem",
      description: "Remove problems from the platform",
      icon: Trash2,
      color: "btn-error",
      route: "/admin/delete",
    },
    {
      id: "video",
      title: "Video Problems",
      description: "Upload and manage solution videos",
      icon: Video,
      color: "btn-success",
      route: "/admin/video",
    },
  ];

  return (
    <div className="min-h-screen bg-base-200/80 px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-success mb-3">
            Admin Panel
          </h1>
          <p className="text-base-content/70 text-lg">
            Manage problems and platform content
          </p>
        </div>

        {/* ================= OPTIONS GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminOptions.map(option => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="bg-base-100/50 backdrop-blur border border-base-content/10 rounded-xl p-6 hover:bg-base-100/70 transition-all"
              >
                <div className="flex flex-col items-center text-center h-full">
                  
                  {/* Icon */}
                  <div className="mb-4 p-4 rounded-full bg-base-200/60 border border-base-content/10">
                    <Icon size={32} className="text-success" />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-2">
                    {option.title}
                  </h2>

                  {/* Description */}
                  <p className="text-base-content/60 mb-6">
                    {option.description}
                  </p>

                  {/* Action */}
                  <NavLink
                    to={option.route}
                    className={`btn ${option.color} btn-sm mt-auto`}
                  >
                    {option.title}
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Admin;
