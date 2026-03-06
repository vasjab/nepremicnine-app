'use client';

import { UserCheck, Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CollapsibleProfileCard } from './CollapsibleProfileCard';
import type { ProfileFormData } from './types';

interface ReferencesSectionProps {
  data: ProfileFormData;
  onUpdate: (patch: Partial<ProfileFormData>) => void;
}

export function ReferencesSection({ data, onUpdate }: ReferencesSectionProps) {
  const updateRef = (index: number, field: string, value: string) => {
    const updated = [...data.renter_references];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ renter_references: updated });
  };

  const removeRef = (index: number) => {
    onUpdate({ renter_references: data.renter_references.filter((_, i) => i !== index) });
  };

  const addRef = () => {
    onUpdate({ renter_references: [...data.renter_references, { name: '', contact: '', relationship: '' }] });
  };

  return (
    <CollapsibleProfileCard title="References" icon={UserCheck} defaultOpen={false}>
      <div className="space-y-4">
        {data.renter_references.map((ref, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reference {i + 1}
              </span>
              <button
                onClick={() => removeRef(i)}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                aria-label={`Remove reference ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Input
              placeholder="Full name"
              value={ref.name}
              onChange={(e) => updateRef(i, 'name', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Email or phone"
              value={ref.contact}
              onChange={(e) => updateRef(i, 'contact', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Relationship (e.g. Previous landlord)"
              value={ref.relationship}
              onChange={(e) => updateRef(i, 'relationship', e.target.value)}
              className="text-sm"
            />
          </div>
        ))}
        {data.renter_references.length < 3 && (
          <button
            onClick={addRef}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm font-medium text-muted-foreground hover:border-gray-400 hover:text-foreground transition-colors w-full justify-center"
          >
            <Plus className="h-4 w-4" /> Add a reference
          </button>
        )}
        {data.renter_references.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No references added yet.</p>
        )}
      </div>
    </CollapsibleProfileCard>
  );
}
