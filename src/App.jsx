import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Package,
  Search,
  Boxes,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Scale,
  Truck,
  PlusCircle,
  Save,
  Download,
  Smartphone,
  FolderOpen,
  ExternalLink,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  "Produits secs",
  "Sauces",
  "Dada",
  "Red Bull",
  "Hygienne",
  "Poulet",
  "Tiramisu",
  "Autres",
];

const storageKey = "inventory";
const makeUnits = (units) => units;
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const getTotalUnits = (units) =>
  Object.values(units || {}).reduce((acc, value) => acc + Number(value || 0), 0);

const getDiffMap = (morningUnits = {}, eveningUnits = {}) => {
  const allUnits = new Set([...Object.keys(morningUnits), ...Object.keys(eveningUnits)]);
  const result = {};

  allUnits.forEach((unit) => {
    const matin = Number(morningUnits[unit] || 0);
    const soir = Number(eveningUnits[unit] || 0);
    result[unit] = soir - matin;
  });

  return result;
};

const getDiffTotal = (diffMap = {}) =>
  Object.values(diffMap).reduce((acc, value) => acc + Number(value || 0), 0);

const getLossTotal = (diffMap = {}) =>
  Object.values(diffMap).reduce((acc, value) => (value < 0 ? acc + Math.abs(value) : acc), 0);

const formatUnits = (units = {}) =>
  Object.entries(units)
    .map(([unit, qty]) => `${qty} ${unit}`)
    .join(" · ");

const baseInventory = {
  "Produits secs": [
    { id: 1, name: "Riz", units: makeUnits({ sacs: 0 }), min: 5, note: "20 kg" },
    { id: 2, name: "Huile", units: makeUnits({ bidons: 0 }), min: 1, note: "25 L" },
    { id: 3, name: "Panko", units: makeUnits({ sacs: 0 }), min: 4, note: "1 kg x 10" },
    { id: 4, name: "Crispy onions", units: makeUnits({ cartons: 0, sachets: 0 }), min: 3, note: "carton + sachet" },
    { id: 5, name: "Poivre", units: makeUnits({ cartons: 0, sacs: 0 }), min: 1, note: "carton + sac · 500 g" },
    { id: 6, name: "Sucre", units: makeUnits({ cartons: 0, sacs: 0 }), min: 2, note: "carton + sac · 1 kg" },
    { id: 7, name: "Gingembre", units: makeUnits({ cartons: 0, sacs: 0 }), min: 3, note: "carton + sac · 500 g" },
    { id: 8, name: "Ail", units: makeUnits({ cartons: 0, sacs: 0 }), min: 3, note: "carton + sac · 500 g" },
    { id: 9, name: "Persil", units: makeUnits({ cartons: 0, sacs: 0 }), min: 2, note: "carton + sac · x500 g" },
  ],
  Sauces: [
    { id: 10, name: "Sauce sucrée", units: makeUnits({ cartons: 0, bidons: 0 }), min: 4, note: "1 carton = 3 bidons de 1.5L" },
    { id: 11, name: "Sauce piquante", units: makeUnits({ cartons: 0, bouteilles: 0 }), min: 3, note: "1 carton = 12 bouteilles" },
    { id: 12, name: "Sauce huître", units: makeUnits({ cartons: 0, bidons: 0 }), min: 4, note: "1 carton = 3 bidons de 1.5L" },
    { id: 13, name: "Sauce maison", units: makeUnits({ cartons: 0, sacs: 0, cages: 0 }), min: 3, note: "1 cage = 2 sacs de 10L" },
    { id: 14, name: "Sauce curry", units: makeUnits({ cartons: 0, sacs: 0, cages: 0 }), min: 2, note: "1 cage = 2 sacs de 10L" },
    { id: 15, name: "Sauce thai", units: makeUnits({ cartons: 0, sacs: 0, cages: 0 }), min: 4, note: "1 cage = 2 sacs de 10L" },
  ],
  Dada: [
    { id: 16, name: "Fraise", units: makeUnits({ cartons: 0 }), min: 2, note: "" },
    { id: 17, name: "Mangue", units: makeUnits({ cartons: 0 }), min: 4, note: "" },
    { id: 18, name: "Ice tea", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 19, name: "Cola zéro", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 20, name: "Cola", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 21, name: "Cola cherry", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 22, name: "Cherry", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 23, name: "Mojito", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 24, name: "Lychee", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 25, name: "Melon", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 26, name: "Peche", units: makeUnits({ cartons: 0 }), min: 4, note: "" },
    { id: 27, name: "Lemon", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 28, name: "Apple", units: makeUnits({ cartons: 0 }), min: 4, note: "" },
  ],
  "Red Bull": [
    { id: 29, name: "Sakura", units: makeUnits({ cartons: 0 }), min: 5, note: "" },
    { id: 30, name: "Pomme gingembre", units: makeUnits({ cartons: 0 }), min: 2, note: "" },
    { id: 31, name: "Tropical", units: makeUnits({ cartons: 0 }), min: 2, note: "" },
    { id: 32, name: "Pink white peach", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 33, name: "Blue", units: makeUnits({ cartons: 0 }), min: 2, note: "" },
    { id: 34, name: "Poire épicée", units: makeUnits({ cartons: 0 }), min: 2, note: "" },
    { id: 35, name: "Apple muscat", units: makeUnits({ cartons: 0 }), min: 3, note: "" },
    { id: 36, name: "Vanille mûre givre", units: makeUnits({ cartons: 0 }), min: 2, note: "" },
    { id: 37, name: "Eau", units: makeUnits({ packs: 0 }), min: 2, note: "" },
  ],
  Hygienne: [
    { id: 38, name: "Liquide vaisselle", units: makeUnits({ cartons: 0, bidons: 0 }), min: 1, note: "1 carton = 3 bidons de 1.5L · Orapi" },
    { id: 39, name: "Nettoyant sol", units: makeUnits({ cartons: 0, bidons: 0 }), min: 1, note: "1 carton = 3 bidons de 1.5L" },
    { id: 40, name: "Nettoyant surface alimentaire", units: makeUnits({ cartons: 0, bidons: 0 }), min: 1, note: "1 carton = 3 bidons de 1.5L" },
    { id: 41, name: "Décapant", units: makeUnits({ cartons: 0, bidons: 0 }), min: 5, note: "1 carton = 3 bidons de 1.5L" },
    { id: 42, name: "Crème lavante", units: makeUnits({ cartons: 0, bidons: 0 }), min: 2, note: "1 carton = 3 bidons de 1.5L" },
    { id: 43, name: "Nettoyant vitres", units: makeUnits({ cartons: 0, bidons: 0 }), min: 1, note: "1 carton = 3 bidons de 1.5L" },
  ],
  Poulet: [
    { id: 44, name: "Poulet frais", units: makeUnits({ kg: 0 }), min: 40, note: "aiguillettes" },
    { id: 45, name: "Poulet mariné", units: makeUnits({ bacs: 0, kg: 0 }), min: 4, note: "" },
    { id: 46, name: "Poulet chapelet", units: makeUnits({ bacs: 0, kg: 0 }), min: 1, note: "" },
  ],
  Tiramisu: [
    { id: 47, name: "Pistache", units: makeUnits({ unités: 0 }), min: 3, note: "" },
    { id: 48, name: "Fraise", units: makeUnits({ unités: 0 }), min: 1, note: "" },
    { id: 49, name: "Twix", units: makeUnits({ unités: 0 }), min: 1, note: "" },
    { id: 50, name: "Blue magic", units: makeUnits({ unités: 0 }), min: 2, note: "" },
    { id: 51, name: "Choco nut", units: makeUnits({ unités: 0 }), min: 1, note: "" },
    { id: 52, name: "Caramel salé", units: makeUnits({ unités: 0 }), min: 2, note: "" },
    { id: 53, name: "Daims", units: makeUnits({ unités: 0 }), min: 3, note: "" },
    { id: 54, name: "Tarte daims", units: makeUnits({ cartons: 0 }), min: 4, note: "" },
  ],
  Autres: [
    { id: 55, name: "Sac kraft", units: makeUnits({ cartons: 0 }), min: 8, note: "" },
    { id: 56, name: "Gant XL", units: makeUnits({ cartons: 0, "petites boîtes": 0 }), min: 1, note: "x100" },
    { id: 57, name: "Gant L", units: makeUnits({ cartons: 0, "petites boîtes": 0 }), min: 1, note: "x100" },
    { id: 58, name: "Charlotte", units: makeUnits({ sacs: 0 }), min: 1, note: "" },
    { id: 59, name: "Cache barbe", units: makeUnits({ sacs: 0 }), min: 1, note: "" },
    { id: 60, name: "Tablier", units: makeUnits({ sachets: 0 }), min: 1, note: "x100" },
    { id: 61, name: "Box hp6", units: makeUnits({ unités: 0 }), min: 1, note: "petite" },
    { id: 62, name: "Box hp3", units: makeUnits({ unités: 0 }), min: 5, note: "grande" },
    { id: 63, name: "Essuie tout", units: makeUnits({ packs: 0, rouleaux: 0 }), min: 2, note: "x6 + rouleaux" },
    { id: 64, name: "Serviettes", units: makeUnits({ cartons: 0, sachets: 0 }), min: 2, note: "" },
    { id: 65, name: "Cuillères noir", units: makeUnits({ cartons: 0 }), min: 1, note: "x1000" },
    { id: 66, name: "Cuillère transparente", units: makeUnits({ cartons: 0, sachets: 0 }), min: 3, note: "x1000" },
    { id: 67, name: "Sac plastique", units: makeUnits({ cartons: 0 }), min: 2, note: "x500" },
    { id: 68, name: "Rouleaux bobine 57x40", units: makeUnits({ cartons: 0, sachets: 0 }), min: 1, note: "sachet x10" },
    { id: 69, name: "Rouleaux bobine 80x80", units: makeUnits({ cartons: 0, sachets: 0 }), min: 1, note: "sachet x3" },
    { id: 70, name: "Filtre friteuse", units: makeUnits({ cartons: 0, filtres: 0 }), min: 1, note: "carton x100" },
    { id: 71, name: "Sac poubelle", units: makeUnits({ cartons: 0 }), min: 2, note: "130L" },
    { id: 72, name: "Pot à sauce 30cc", units: makeUnits({ cartons: 0 }), min: 1, note: "x500" },
    { id: 73, name: "Pot à sauce 50cc", units: makeUnits({ cartons: 0 }), min: 1, note: "x500" },
    { id: 74, name: "Lavettes rouge", units: makeUnits({ sachets: 0 }), min: 4, note: "" },
    { id: 75, name: "Lavettes bleu", units: makeUnits({ sachets: 0 }), min: 3, note: "" },
    { id: 76, name: "Lavettes vert", units: makeUnits({ sachets: 0 }), min: 1, note: "" },
  ],
};

const createDefaultDayInventory = (inventory) => ({
  matin: deepClone(inventory),
  soir: deepClone(inventory),
});

const buildDeliveryDraft = (inventory) => {
  const draft = {};
  Object.entries(inventory).forEach(([category, items]) => {
    draft[category] = items.map((item) => ({
      id: item.id,
      units: Object.fromEntries(Object.keys(item.units || {}).map((unit) => [unit, 0])),
    }));
  });
  return draft;
};

const exportToCSV = (data, date, period) => {
  const rows = [];

  rows.push(["Inventaire restaurant"]);
  rows.push(["Date", date]);
  rows.push(["Moment", period]);
  rows.push([]);

  Object.entries(data).forEach(([category, items]) => {
    rows.push([category]);
    rows.push(["Produit", "Détail des quantités"]);

    items.forEach((item) => {
      rows.push([item.name, formatUnits(item.units)]);
    });

    rows.push([]);
  });

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `inventaire_complet_${date}_${period}.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

function StockBadge({ units, min }) {
  const total = getTotalUnits(units);
  const low = total <= min;
  return (
    <Badge variant={low ? "destructive" : "secondary"} className="rounded-full px-3 py-1">
      {low ? "Stock bas" : "Stock OK"}
    </Badge>
  );
}

function DiffBadge({ diff }) {
  if (diff === 0) {
    return <Badge className="rounded-full bg-slate-200 text-slate-700 hover:bg-slate-200">Stable</Badge>;
  }
  if (diff < 0) {
    return <Badge className="rounded-full bg-red-100 text-red-700 hover:bg-red-100">Perte</Badge>;
  }
  return <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ajout</Badge>;
}

function MobileSectionCard({ icon: Icon, title, subtitle, action }) {
  return (
    <Card className="rounded-2xl border bg-white shadow-sm">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export default function InventaireRestaurantApp() {
  const todayKey = new Date().toISOString().slice(0, 10);

  const [dailyInventory, setDailyInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : { [todayKey]: createDefaultDayInventory(baseInventory) };
    } catch {
      return { [todayKey]: createDefaultDayInventory(baseInventory) };
    }
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [period, setPeriod] = useState("matin");
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [search, setSearch] = useState("");
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [deliveryCategory, setDeliveryCategory] = useState(categories[0]);
  const [deliveryDraft, setDeliveryDraft] = useState(() => buildDeliveryDraft(baseInventory));
  const [saveMessage, setSaveMessage] = useState("");
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dailyInventory));
    } catch {
      // ignore storage errors in preview
    }
  }, [dailyInventory]);

  const ensureDateInventory = (dateKey) => {
    setDailyInventory((prev) => {
      if (prev[dateKey]) return prev;
      return {
        ...prev,
        [dateKey]: createDefaultDayInventory(baseInventory),
      };
    });
  };

  const dayInventory = dailyInventory[selectedDate] || createDefaultDayInventory(baseInventory);
  const morningInventory = dayInventory.matin || baseInventory;
  const eveningInventory = dayInventory.soir || baseInventory;
  const currentInventory = dayInventory[period] || baseInventory;

  const items = currentInventory[activeCategory] || [];
  const morningItems = morningInventory[activeCategory] || [];
  const eveningItems = eveningInventory[activeCategory] || [];
  const deliveryItems = currentInventory[deliveryCategory] || [];
  const deliveryDraftForCategory = deliveryDraft[deliveryCategory] || [];

  const isMatin = period === "matin";
  const themeBg = isMatin ? "bg-blue-50" : "bg-orange-50";
  const cardBg = isMatin ? "bg-blue-100" : "bg-orange-100";
  const productBg = isMatin ? "bg-blue-200/70 border-blue-300" : "bg-orange-200/70 border-orange-300";
  const chipBg = isMatin ? "bg-blue-200 text-blue-900" : "bg-orange-200 text-orange-900";

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      [item.name, item.note, ...Object.keys(item.units || {})]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [items, search]);

  const savedDates = useMemo(() => {
    return Object.keys(dailyInventory).sort((a, b) => (a < b ? 1 : -1));
  }, [dailyInventory]);

  const lowStockCount = useMemo(() => {
    return Object.values(currentInventory)
      .flat()
      .filter((item) => getTotalUnits(item.units) <= item.min).length;
  }, [currentInventory]);

  const totalItems = useMemo(
    () => Object.values(currentInventory).reduce((acc, arr) => acc + arr.length, 0),
    [currentInventory]
  );

  const categoryInsights = useMemo(() => {
    const morningMap = Object.fromEntries(morningItems.map((item) => [item.id, item]));
    const eveningMap = Object.fromEntries(eveningItems.map((item) => [item.id, item]));
    const ids = [...new Set([...Object.keys(morningMap), ...Object.keys(eveningMap)])];

    const details = ids.map((id) => {
      const morningItem = morningMap[id];
      const eveningItem = eveningMap[id];
      const diffMap = getDiffMap(morningItem?.units || {}, eveningItem?.units || {});
      return {
        id,
        diffTotal: getDiffTotal(diffMap),
        lossTotal: getLossTotal(diffMap),
      };
    });

    return {
      totalDiff: details.reduce((acc, item) => acc + item.diffTotal, 0),
      totalLoss: details.reduce((acc, item) => acc + item.lossTotal, 0),
      consommationReelle: details.reduce((acc, item) => acc + item.lossTotal, 0),
    };
  }, [morningItems, eveningItems]);

  const changeDay = (offset) => {
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + offset);
    const nextKey = current.toISOString().slice(0, 10);
    ensureDateInventory(nextKey);
    setSelectedDate(nextKey);
  };

  const handleDateInput = (value) => {
    if (!value) return;
    ensureDateInventory(value);
    setSelectedDate(value);
  };

  const updateUnitQuantity = (category, id, unit, value) => {
    const numericValue = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
    setDailyInventory((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [period]: {
          ...prev[selectedDate][period],
          [category]: prev[selectedDate][period][category].map((item) =>
            item.id === id
              ? { ...item, units: { ...item.units, [unit]: numericValue } }
              : item
          ),
        },
      },
    }));
  };

  const updateDeliveryDraftValue = (category, id, unit, value) => {
    const numericValue = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
    setDeliveryDraft((prev) => ({
      ...prev,
      [category]: (prev[category] || []).map((item) =>
        item.id === id
          ? { ...item, units: { ...item.units, [unit]: numericValue } }
          : item
      ),
    }));
  };

  const applyDeliveryToInventory = () => {
    setDailyInventory((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [period]: {
          ...prev[selectedDate][period],
          [deliveryCategory]: prev[selectedDate][period][deliveryCategory].map((inventoryItem) => {
            const draftItem = (deliveryDraft[deliveryCategory] || []).find((entry) => entry.id === inventoryItem.id);
            if (!draftItem) return inventoryItem;

            const mergedUnits = { ...inventoryItem.units };
            Object.entries(draftItem.units || {}).forEach(([unit, qty]) => {
              mergedUnits[unit] = Number(mergedUnits[unit] || 0) + Number(qty || 0);
            });

            return { ...inventoryItem, units: mergedUnits };
          }),
        },
      },
    }));

    setDeliveryDraft((prev) => ({
      ...prev,
      [deliveryCategory]: (prev[deliveryCategory] || []).map((item) => ({
        ...item,
        units: Object.fromEntries(Object.keys(item.units || {}).map((unit) => [unit, 0])),
      })),
    }));

    setIsDeliveryOpen(false);
  };

  const openDeliveryModal = () => {
    setDeliveryCategory(activeCategory);
    setDeliveryDraft(buildDeliveryDraft(currentInventory));
    setIsDeliveryOpen(true);
  };

  const openSavedDate = (dateKey) => {
    ensureDateInventory(dateKey);
    setSelectedDate(dateKey);
    setShowArchive(false);
  };

  const exportSavedDate = (dateKey, savedPeriod) => {
    const snapshot = dailyInventory[dateKey]?.[savedPeriod];
    if (!snapshot) return;
    exportToCSV(snapshot, dateKey, savedPeriod);
    setSaveMessage(`Export ${savedPeriod} du ${dateKey} téléchargé.`);
  };

  const handleSaveLocal = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dailyInventory));
      setSaveMessage("Inventaire sauvegardé localement.");
    } catch {
      setSaveMessage("Impossible de sauvegarder localement.");
    }
  };

  const handleExport = () => {
    exportToCSV(currentInventory, selectedDate, period);
    setSaveMessage("Export CSV téléchargé.");
  };

  const currentDateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`min-h-screen ${themeBg} p-3 sm:p-4 md:p-8`}>
      <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          <Card className="rounded-2xl shadow-sm md:col-span-2 xl:col-span-4">
            <CardContent className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Suivi quotidien</p>
                <p className="text-xl sm:text-2xl font-semibold capitalize">{currentDateLabel}</p>
                <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${chipBg}`}>
                  Inventaire du {period}
                </p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={period === "matin" ? "default" : "outline"} className="rounded-2xl" onClick={() => setPeriod("matin")}>Matin</Button>
                  <Button variant={period === "soir" ? "default" : "outline"} className="rounded-2xl" onClick={() => setPeriod("soir")}>Soir</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={() => changeDay(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" className="rounded-2xl" onClick={() => { ensureDateInventory(todayKey); setSelectedDate(todayKey); }}>Aujourd'hui</Button>
                  <Button variant="outline" className="rounded-2xl" onClick={() => changeDay(1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 shadow-sm">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  <Input type="date" value={selectedDate} onChange={(e) => handleDateInput(e.target.value)} className="border-0 p-0 shadow-none focus-visible:ring-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-2xl shadow-sm ${cardBg}`}><CardContent className="flex items-center gap-4 p-4 sm:p-6"><div className="rounded-2xl bg-white p-3 shadow-sm"><Boxes className="h-6 w-6" /></div><div><p className="text-sm text-slate-500">Références du {period}</p><p className="text-2xl font-semibold">{totalItems}</p></div></CardContent></Card>
          <Card className={`rounded-2xl shadow-sm ${cardBg}`}><CardContent className="flex items-center gap-4 p-4 sm:p-6"><div className="rounded-2xl bg-white p-3 shadow-sm"><AlertTriangle className="h-6 w-6" /></div><div><p className="text-sm text-slate-500">Produits à surveiller</p><p className="text-2xl font-semibold">{lowStockCount}</p></div></CardContent></Card>
          <Card className={`rounded-2xl shadow-sm ${cardBg}`}><CardContent className="flex items-center gap-4 p-4 sm:p-6"><div className="rounded-2xl bg-white p-3 shadow-sm"><Scale className="h-6 w-6" /></div><div><p className="text-sm text-slate-500">Diff matin / soir</p><p className="text-2xl font-semibold">{categoryInsights.totalDiff > 0 ? "+" : ""}{categoryInsights.totalDiff}</p></div></CardContent></Card>
          <Card className={`rounded-2xl shadow-sm ${cardBg}`}><CardContent className="flex items-center gap-4 p-4 sm:p-6"><div className="rounded-2xl bg-white p-3 shadow-sm"><BarChart3 className="h-6 w-6" /></div><div><p className="text-sm text-slate-500">Consommation réelle</p><p className="text-2xl font-semibold">{categoryInsights.consommationReelle}</p></div></CardContent></Card>
        </motion.div>

        <div className="grid gap-3 lg:hidden">
          <MobileSectionCard
            icon={Smartphone}
            title="Version mobile prête"
            subtitle="Interface optimisée pour téléphone"
            action={<Badge className="rounded-full">Mobile</Badge>}
          />
          <MobileSectionCard
            icon={ExternalLink}
            title="Accès à l'application"
            subtitle="Version prête pour déploiement web"
            action={<Badge className="rounded-full">Vercel</Badge>}
          />
          <MobileSectionCard
            icon={FolderOpen}
            title="Sauvegardes et exports"
            subtitle="Retrouve les dates sauvegardées"
            action={<Button variant="outline" className="rounded-2xl" onClick={() => setShowArchive(true)}>Ouvrir</Button>}
          />
        </div>

        <Card className={`rounded-2xl shadow-sm ${cardBg}`}>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl"><Package className="h-6 w-6" />Inventaire du restaurant</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Version prête pour déploiement Vercel avec sauvegarde locale, export CSV, suivi matin/soir et rajout de livraison.</p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <Button className="rounded-2xl" onClick={handleSaveLocal}><Save className="mr-2 h-4 w-4" /> Sauvegarder</Button>
                <Button className="rounded-2xl" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export Excel</Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => setShowArchive(true)}><Database className="mr-2 h-4 w-4" /> Sauvegardes</Button>
                <Dialog open={isDeliveryOpen} onOpenChange={setIsDeliveryOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-2xl" onClick={openDeliveryModal}><Truck className="mr-2 h-4 w-4" /> Rajout livraison</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-hidden rounded-2xl sm:max-w-4xl">
                    <DialogHeader><DialogTitle>Ajouter une livraison au stock du {period}</DialogTitle></DialogHeader>
                    <div className="space-y-4 overflow-hidden">
                      <Tabs value={deliveryCategory} onValueChange={setDeliveryCategory}>
                        <div className="-mx-1 overflow-x-scroll overscroll-x-contain pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <TabsList className="inline-flex h-auto w-max gap-2 rounded-2xl bg-transparent px-1 py-0">
                            {categories.map((category) => (
                              <TabsTrigger
                                key={category}
                                value={category}
                                className="shrink-0 whitespace-nowrap rounded-2xl border bg-white px-4 py-2 text-sm data-[state=active]:shadow-sm"
                              >
                                {category}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </div>
                      </Tabs>
                      <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-2">
                        {deliveryItems.map((item) => {
                          const draftItem = deliveryDraftForCategory.find((entry) => entry.id === item.id);
                          return (
                            <Card key={item.id} className="rounded-2xl border bg-slate-50 shadow-sm">
                              <CardContent className="space-y-3 p-4">
                                <div>
                                  <p className="text-base font-semibold">{item.name}</p>
                                  <p className="text-sm text-slate-500">Stock actuel : {formatUnits(item.units)}</p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {Object.entries(item.units || {}).map(([unit]) => (
                                    <div key={unit} className="flex items-center justify-between rounded-2xl bg-white p-3 gap-3">
                                      <div><p className="text-sm text-slate-500">Ajouter en {unit}</p></div>
                                      <Input type="number" min="0" inputMode="numeric" value={draftItem?.units?.[unit] ?? 0} onFocus={(e) => e.target.select()} onClick={(e) => e.currentTarget.select()} onChange={(e) => updateDeliveryDraftValue(deliveryCategory, item.id, unit, e.target.value)} className="w-24 sm:w-28 rounded-xl bg-white text-right text-base sm:text-lg font-semibold" />
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" className="rounded-2xl" onClick={() => setIsDeliveryOpen(false)}>Annuler</Button>
                        <Button className="rounded-2xl" onClick={applyDeliveryToInventory}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter au stock</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {saveMessage ? <p className="text-sm text-slate-600">{saveMessage}</p> : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <div className="-mx-1 overflow-x-scroll overscroll-x-contain pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="inline-flex h-auto w-max gap-2 rounded-2xl bg-transparent px-1 py-0">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="shrink-0 whitespace-nowrap rounded-2xl border bg-white px-4 py-2 text-sm data-[state=active]:shadow-sm"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="rounded-2xl pl-9" placeholder="Rechercher un produit ou une unité..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => {
                const morningItem = morningItems.find((entry) => entry.id === item.id);
                const eveningItem = eveningItems.find((entry) => entry.id === item.id);
                const diffMap = getDiffMap(morningItem?.units || {}, eveningItem?.units || {});
                const itemDiff = getDiffTotal(diffMap);
                const itemLoss = getLossTotal(diffMap);

                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <Card className={`rounded-2xl shadow-sm border ${productBg}`}>
                      <CardContent className="space-y-4 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-semibold">{item.name}</h3>
                              <StockBadge units={item.units} min={item.min} />
                              <DiffBadge diff={itemDiff} />
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{item.note || "Aucune précision"}</p>
                            <p className="mt-1 text-xs text-slate-400">{formatUnits(item.units)}</p>
                            <p className="mt-1 text-xs text-slate-500">Perte détectée : {itemLoss}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {Object.entries(item.units || {}).map(([unit, qty]) => (
                            <div key={unit} className="flex items-center justify-between rounded-2xl bg-white/70 p-3 gap-3">
                              <div><p className="text-sm text-slate-500">{unit}</p></div>
                              <Input type="number" min="0" inputMode="numeric" value={qty} onFocus={(e) => e.target.select()} onClick={(e) => e.currentTarget.select()} onChange={(e) => updateUnitQuantity(activeCategory, item.id, unit, e.target.value)} className="w-24 sm:w-28 rounded-xl bg-white text-right text-base sm:text-lg font-semibold" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showArchive} onOpenChange={setShowArchive}>
          <DialogContent className="max-h-[85vh] overflow-hidden rounded-2xl sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Sauvegardes locales et exports</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto overscroll-y-contain pr-1 touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p><strong>Application :</strong> prête à être déployée sur Vercel.</p>
                  <p className="mt-1"><strong>Sauvegardes / exports :</strong> accessibles depuis cette fenêtre dans l'application.</p>
                </div>

                {savedDates.map((dateKey) => (
                  <Card key={dateKey} className="rounded-2xl border bg-white shadow-sm">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{dateKey}</p>
                          <p className="text-sm text-slate-500">Inventaires matin et soir disponibles</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl" onClick={() => openSavedDate(dateKey)}>
                          Ouvrir cette date
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button className="rounded-2xl" onClick={() => exportSavedDate(dateKey, "matin")}>Exporter matin</Button>
                        <Button className="rounded-2xl" onClick={() => exportSavedDate(dateKey, "soir")}>Exporter soir</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Tests manuels
// 1. L'app doit se charger sans erreur même si localStorage est vide.
// 2. Cliquer sur Sauvegarder puis recharger la page doit conserver les données.
// 3. Export Excel doit télécharger un CSV avec : titre, date, moment, puis chaque section avec la liste des produits et leurs quantités.
// 4. Le rajout livraison doit augmenter les quantités de la catégorie choisie.
// 5. Changer entre matin et soir doit garder deux inventaires distincts.
// 6. En mobile, les boutons principaux doivent rester cliquables, les champs quantités lisibles, et la liste des catégories doit défiler horizontalement au doigt avec une vraie zone de scroll tactile.
// 7. La fenêtre Sauvegardes doit permettre d'ouvrir une date et d'exporter matin ou soir.
// 8. Après déploiement Vercel, localStorage doit continuer à fonctionner sur le domaine déployé.
