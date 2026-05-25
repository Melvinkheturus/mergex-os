"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function NewLeadPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 py-5">
      <div className="flex items-center gap-3 pb-6 border-b border-[#E5E7EB] dark:border-[#26262C] mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Add New Lead</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enter details to add a new lead to your pipeline.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="bg-white dark:bg-[#16161A] border-[#E5E7EB] dark:border-[#26262C]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#8B5CF6]" /> 
              Lead Information
            </CardTitle>
            <CardDescription>
              Basic contact and company information for the new prospect.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="e.g. John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="e.g. Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="e.g. john@company.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. SaaS" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source Tag</Label>
              <Input id="source" placeholder="e.g. Inbound, Outbound, Referral" />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white" onClick={() => router.push("/dashboard/pipeline")}>
                Save Lead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
