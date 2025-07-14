import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import PetListPage from "../pages/PetListPage";
import PetRegisterPage from "../pages/PetRegisterPage";
import PetDetailPage from "../pages/PetDetailPage";
import PostDetailPage from "../pages/PostDetailPage";
import PostCreatePage from "../pages/PostCreatePage";
import PetEditPage from "../pages/PetEditPage";
import PostEditPage from "../pages/PostEditPage";
import UserProfilePage from "../pages/UserProfilePage";
import EditProfilePage from "../pages/EditProfilePage";
import AdminPage from "../pages/AdminPage";
import WalkPage from "../pages/WalkPage";
import WalkDetailPage from "../pages/WalkDetailPage";
import WalkEditPage from "../pages/WalkEditPage";

const AppRoutes = [
  {
    id: 1,
    name: "홈 화면",
    path: "/",
    element: HomePage,
  },
  {
    id: 2,
    name: "로그인 화면",
    path: "/login",
    element: LoginPage,
  },
  {
    id: 3,
    name: "회원가입 화면",
    path: "/register",
    element: RegisterPage,
  },
  {
    id: 4,
    name: "프로필 화면",
    path: "/profile",
    element: ProfilePage,
  },
  {
    id: 5,
    name: "반려동물 목록",
    path: "/pets",
    element: PetListPage,
  },
  {
    id: 6,
    name: "반려동물 등록",
    path: "/pets/register",
    element: PetRegisterPage,
  },
  {
    id: 7,
    name: "반려동물 프로필",
    path: "/pets/:id",
    element: PetDetailPage,
  },
  {
    id: 8,
    name: "포스트 작성",
    path: "/posts/new",
    element: PostCreatePage,
  },
  {
    id: 9,
    name: "게시글 상세",
    path: "/posts/:id",
    element: PostDetailPage,
  },
  {
    id: 10,
    name: "게시글 수정",
    path: "/posts/:id/edit",
    element: PostEditPage,
  },
  {
    id: 11,
    name: "반려동물 수정",
    path: "/pets/:id/edit",
    element: PetEditPage,
  },
  {
    id: 12,
    name: "마이페이지",
    path: "/users/me",
    element: ProfilePage,
  },
  {
    id: 13,
    name: "유저페이지",
    path: "/users/:id",
    element: UserProfilePage,
  },
  {
    id: 14,
    name: "프로필 편집",
    path: "/profile/edit",
    element: EditProfilePage,
  },
  {
    id: 15,
    name: "관리자 페이지",
    path: "/admin",
    element: AdminPage,
  },
  {
    id: 16,
    name: "산책 페이지",
    path: "/walks", // General walks page
    element: WalkPage,
  },
  {
    id: 17,
    name: "특정 반려동물 산책 페이지",
    path: "/walks/pets/:petId", // Specific pet walks
    element: WalkPage,
  },
  {
    id: 18,
    name: "산책 상세 페이지",
    path: "/walks/:id",
    element: WalkDetailPage,
  },
  {
    id: 19,
    name: "산책 상세 수정 페이지",
    path: "/walks/:walkId/edit",
    element: WalkEditPage,
  },
];

export default AppRoutes;
