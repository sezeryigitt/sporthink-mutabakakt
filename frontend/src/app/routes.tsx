import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedOutlet } from "./auth/ProtectedOutlet";
import LoginPage from "./pages/LoginPage";
import YonetimOzeti from "./pages/YonetimOzeti";
import VeriAktarimi from "./pages/VeriAktarimi";
import KomisyonMutabakati from "./pages/KomisyonMutabakati";
import DesiKargoMutabakati from "./pages/DesiKargoMutabakati";
import SiparisKarliligi from "./pages/SiparisKarliligi";
import FarkIncelemeKuyrugu from "./pages/FarkIncelemeKuyrugu";
import PazaryeriAyarlari from "./pages/PazaryeriAyarlari";
import KullanicilarveLogllar from "./pages/KullanicilarveLogllar";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    Component: ProtectedOutlet,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: YonetimOzeti },
          { path: "veri-aktarimi", Component: VeriAktarimi },
          { path: "komisyon-mutabakati", Component: KomisyonMutabakati },
          { path: "desi-kargo-mutabakati", Component: DesiKargoMutabakati },
          { path: "siparis-karliligi", Component: SiparisKarliligi },
          { path: "fark-inceleme-kuyrugu", Component: FarkIncelemeKuyrugu },
          { path: "pazaryeri-ayarlari", Component: PazaryeriAyarlari },
          { path: "kullanicilar-ve-loglar", Component: KullanicilarveLogllar },
        ],
      },
    ],
  },
]);
