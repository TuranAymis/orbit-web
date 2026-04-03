import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/PublicOnlyRoute";
import { AppShell } from "@/widgets/app-shell/AppShell";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DiscoverPage } from "@/pages/discover/DiscoverPage";
import { GroupsPage } from "@/pages/groups/GroupsPage";
import { GroupDetailPage } from "@/pages/groups/GroupDetailPage";
import { ChatPage } from "@/pages/chat/ChatPage";
import { EventsPage } from "@/pages/events/EventsPage";
import { EventDetailPage } from "@/pages/events/EventDetailPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { MembershipPage } from "@/pages/membership/MembershipPage";

export const routes: RouteObject[] = [
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/discover" replace />,
          },
          {
            path: "discover",
            element: <DiscoverPage />,
          },
          {
            path: "groups",
            element: <GroupsPage />,
          },
          {
            path: "groups/:groupId",
            element: <GroupDetailPage />,
          },
          {
            path: "chat",
            element: <ChatPage />,
          },
          {
            path: "events",
            element: <EventsPage />,
          },
          {
            path: "events/:eventId",
            element: <EventDetailPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "membership",
            element: <MembershipPage />,
          },
        ],
      },
    ],
  },
];
