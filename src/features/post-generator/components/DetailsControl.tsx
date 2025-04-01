"use client"

import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { DetailsOverlay } from "../data/overlay";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DetailsControl() {
    return (
        <div className="flex items-center w-full">
            <Select>
                <SelectTrigger className="w-24 border text-xs focus:ring-0 !h-6">
                    <SelectValue placeholder="Details" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(DetailsOverlay).map(([type]) => (
                        <SelectItem key={type} value={type} className="text-sm">
                            {type}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span className="flex w-full justify-end">
                <Button variant="ghost" size="icon" className="hover:bg-ai-cyan/10 !h-6 !w-6">
                    <Trash />
                </Button>
            </span>
        </div>
    )
}