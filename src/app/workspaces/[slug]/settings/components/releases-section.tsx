"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Settings2, Sparkles, Trash2, Edit3, Plus, ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const OPERATIONAL_CATEGORIES: Record<string, string[]> = {
  "Sales OS": [
    "Lead Intake",
    "Business Review",
    "Lead Qualification",
    "Lead Nurturing",
    "Discovery Meeting",
    "Proposal Management",
  ],
  "Client Execution": [
    "Client Onboarding",
    "Project Delivery",
    "Client Success",
  ],
  "Documents": [
    "Proposal",
    "Quotation",
    "SOW",
    "Agreement",
    "Invoice",
    "Kickoff",
    "CRD",
  ],
  "Platform": [
    "Performance",
    "Security",
    "AI",
    "UI Improvements",
    "Bug Fixes",
  ],
};

interface ChangeLogItem {
  id?: string;
  type: "feature" | "improvement" | "fix";
  category: string;
  subcategory: string | null;
  description: string;
}

interface ReleaseFormData {
  version: string;
  title: string;
  description: string;
  releaseDate: string;
  type: "major" | "minor" | "patch";
  status: "draft" | "published";
  popupEnabled: boolean;
  popupTitle: string;
  popupDescription: string;
  items: ChangeLogItem[];
}

const initialFormState: ReleaseFormData = {
  version: "",
  title: "",
  description: "",
  releaseDate: format(new Date(), "yyyy-MM-dd"),
  type: "minor",
  status: "published",
  popupEnabled: false,
  popupTitle: "",
  popupDescription: "",
  items: [],
};

export function ReleasesSection() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReleaseFormData>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Load releases
  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/releases?includeDrafts=true");
      if (res.ok) {
        const data = await res.json();
        setReleases(data.releases || []);
      } else {
        toast.error("Failed to load releases");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred loading releases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      releaseDate: format(new Date(), "yyyy-MM-dd"),
      items: [],
    });
    setView("form");
  };

  const handleEdit = (release: any) => {
    setEditingId(release.id);
    setFormData({
      version: release.version,
      title: release.title,
      description: release.description,
      releaseDate: format(new Date(release.releaseDate), "yyyy-MM-dd"),
      type: release.type as "major" | "minor" | "patch",
      status: release.status as "draft" | "published",
      popupEnabled: release.popupEnabled,
      popupTitle: release.popupTitle || "",
      popupDescription: release.popupDescription || "",
      items: release.items.map((item: any) => ({
        id: item.id,
        type: item.type as "feature" | "improvement" | "fix",
        category: item.category,
        subcategory: item.subcategory,
        description: item.description,
      })),
    });
    setView("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this release permanently?")) return;

    try {
      const res = await fetch(`/api/releases/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Release deleted successfully");
        fetchReleases();
      } else {
        toast.error("Failed to delete release");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting release");
    }
  };

  const handleAddItem = () => {
    const defaultCategory = Object.keys(OPERATIONAL_CATEGORIES)[0];
    const defaultSubcategory = OPERATIONAL_CATEGORIES[defaultCategory][0];
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          type: "feature",
          category: defaultCategory,
          subcategory: defaultSubcategory,
          description: "",
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof ChangeLogItem, value: any) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index], [field]: value };
      
      // Reset subcategory if category changes
      if (field === "category") {
        const subcategories = OPERATIONAL_CATEGORIES[value] || [];
        item.subcategory = subcategories.length > 0 ? subcategories[0] : null;
      }
      
      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.version.trim() || !formData.title.trim()) {
      toast.error("Version and Title are required");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/releases/${editingId}` : "/api/releases";
      const method = editingId ? "PATCH" : "POST";
      
      const payload = {
        ...formData,
        // Make sure date parses correctly in UTC/local timezone
        releaseDate: new Date(formData.releaseDate).toISOString(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? "Release updated" : "Release created");
        setView("list");
        fetchReleases();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save release");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving release");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {view === "list" ? (
        <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
          <CardHeader className="pb-3 flex flex-row items-center justify-between text-left">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#8B5CF6]" />
                Release Ledger Management
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Draft, publish, and configure operational updates or popup announcements.
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateNew}
              className="h-8 text-xs font-bold bg-[#8B5CF6] hover:bg-[#7c4ee4] text-white rounded-xl gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Release
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
                <span className="text-xs">Loading releases...</span>
              </div>
            ) : releases.length === 0 ? (
              <div className="text-center py-16 text-xs text-muted-foreground border border-dashed border-border/20 rounded-xl">
                No releases added yet. Click &quot;Create Release&quot; to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {releases.map((release) => (
                  <div
                    key={release.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/20 bg-muted/5 gap-4 hover:border-[#8B5CF6]/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-[#8B5CF6] leading-none">{release.version}</span>
                        <span className="text-[7px] text-[#8B5CF6]/60 font-mono mt-0.5 uppercase tracking-wider">{release.type}</span>
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-foreground truncate">{release.title}</p>
                          <Badge
                            variant="outline"
                            className={`text-[8px] uppercase tracking-wider font-semibold py-0 ${
                              release.status === "published"
                                ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/5"
                                : "border-amber-500/20 text-amber-600 bg-amber-500/5"
                            }`}
                          >
                            {release.status}
                          </Badge>
                          {release.popupEnabled && (
                            <Badge
                              variant="outline"
                              className="text-[8px] uppercase tracking-wider border-[#8B5CF6]/20 text-[#8B5CF6] bg-[#8B5CF6]/5 font-semibold py-0"
                            >
                              Popup Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-1">
                          {release.description}
                        </p>
                        <p className="text-[9px] text-neutral-500 font-mono mt-1">
                          Date: {format(new Date(release.releaseDate), "yyyy-MM-dd")} • Items: {release.items?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(release)}
                        className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer rounded-lg"
                        title="Edit Release"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(release.id)}
                        className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/5 cursor-pointer rounded-lg"
                        title="Delete Release"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Form view */
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent text-left">
            <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setView("list")}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  {editingId ? "Edit Release Ledger" : "Create Operational Release"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Populate general version details, timeline ledger cards, and active popups.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="version" className="text-xs font-semibold text-muted-foreground">Version Tag</Label>
                  <Input
                    id="version"
                    placeholder="v1.8.0"
                    value={formData.version}
                    onChange={(e) => setFormData((v) => ({ ...v, version: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground">Release Title</Label>
                  <Input
                    id="title"
                    placeholder="Sales OS Launch"
                    value={formData.title}
                    onChange={(e) => setFormData((v) => ({ ...v, title: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="releaseDate" className="text-xs font-semibold text-muted-foreground">Release Date</Label>
                  <DateTimePicker
                    value={formData.releaseDate}
                    onChange={(val) => setFormData((v) => ({ ...v, releaseDate: val }))}
                    mode="date"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold text-muted-foreground">Release Scale Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData((v) => ({ ...v, type: val as any }))}
                  >
                    <SelectTrigger id="type" className="h-9 text-xs">
                      <SelectValue placeholder="Select scale type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="major">Major (Full Launch / New Module)</SelectItem>
                      <SelectItem value="minor">Minor (New Feature / Improvement)</SelectItem>
                      <SelectItem value="patch">Patch (Bug Fix / Hotfix)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData((v) => ({ ...v, status: val as any }))}
                  >
                    <SelectTrigger id="status" className="h-9 text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Hidden)</SelectItem>
                      <SelectItem value="published">Published (Live)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">Short Description</Label>
                <Textarea
                  id="description"
                  placeholder="Introduced complete lead lifecycle management and secure contract vaulting."
                  value={formData.description}
                  onChange={(e) => setFormData((v) => ({ ...v, description: e.target.value }))}
                  className="text-xs min-h-[80px]"
                />
              </div>

              {/* Popup Switch */}
              <div className="p-4 rounded-xl border border-border/20 bg-muted/5 flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <Label className="text-xs font-bold text-foreground">Enable Welcome Update Popup</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Display an announcement dialog to team members inside the workspace on their next visit.
                  </p>
                </div>
                <Switch
                  checked={formData.popupEnabled}
                  onCheckedChange={(checked) => setFormData((v) => ({ ...v, popupEnabled: checked }))}
                />
              </div>

              {/* Popup Details (Conditional) */}
              {formData.popupEnabled && (
                <div className="p-4 rounded-xl border border-[#8B5CF6]/15 bg-[#8B5CF6]/5 space-y-4 animate-fade-in-up duration-150">
                  <div className="flex gap-2 items-center text-xs text-[#8B5CF6] font-bold">
                    <AlertCircle className="w-4 h-4" />
                    Popup configuration (This will disable other popups automatically on save)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="popupTitle" className="text-xs font-semibold text-muted-foreground">Popup Title</Label>
                      <Input
                        id="popupTitle"
                        placeholder="🚀 MergeX OS Updated"
                        value={formData.popupTitle}
                        onChange={(e) => setFormData((v) => ({ ...v, popupTitle: e.target.value }))}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="popupDescription" className="text-xs font-semibold text-muted-foreground">Popup Description Summary</Label>
                      <Input
                        id="popupDescription"
                        placeholder="Explore the newly launched Lead engine and performance improvements."
                        value={formData.popupDescription}
                        onChange={(e) => setFormData((v) => ({ ...v, popupDescription: e.target.value }))}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RELEASE ITEMS LEDGER */}
              <div className="space-y-3 pt-4 border-t border-border/10">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Release Ledger Items</Label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Declare individual features, improvements, and fixes for the changelog accordion.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    variant="outline"
                    className="h-7 text-[10px] font-bold border-border/20 hover:border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer rounded-lg gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Item
                  </Button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs border border-dashed border-border/10 rounded-xl bg-muted/5">
                    No release ledger items declared yet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border border-border/20 bg-muted/5 flex flex-col md:flex-row gap-3 items-start md:items-center"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                          {/* Item Type */}
                          <Select
                            value={item.type}
                            onValueChange={(val) => handleItemChange(index, "type", val as any)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="feature">Feature</SelectItem>
                              <SelectItem value="improvement">Improvement</SelectItem>
                              <SelectItem value="fix">Fix</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Item Category */}
                          <Select
                            value={item.category}
                            onValueChange={(val) => handleItemChange(index, "category", val)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(OPERATIONAL_CATEGORIES).map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Item Subcategory */}
                          <Select
                            value={item.subcategory || ""}
                            onValueChange={(val) => handleItemChange(index, "subcategory", val || null)}
                            disabled={!item.category}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                              {(OPERATIONAL_CATEGORIES[item.category] || []).map((sub) => (
                                <SelectItem key={sub} value={sub}>
                                  {sub}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Item Description & Delete Button */}
                        <div className="flex gap-2 w-full items-center">
                          <Input
                            placeholder="Introduced complete lead lifecycle management..."
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            className="h-9 text-xs flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/5 cursor-pointer rounded-lg shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            {/* Footer buttons */}
            <div className="p-4 border-t border-border/10 flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setView("list")}
                className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-8 text-xs font-bold bg-[#8B5CF6] hover:bg-[#7c4ee4] text-white rounded-xl gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Save Release
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
