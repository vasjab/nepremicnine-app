'use client';

import { Input } from '@/components/ui/input';
import { Plus, Trash2, UserCheck } from 'lucide-react';

export interface ReferenceEntry {
  name: string;
  contact: string;
  relationship: string;
}

export interface ReferencesData {
  references: ReferenceEntry[];
}

interface ReferencesStepProps {
  data: ReferencesData;
  onChange: (data: ReferencesData) => void;
}

const MAX_REFERENCES = 3;

const emptyRef = (): ReferenceEntry => ({ name: '', contact: '', relationship: '' });

export function ReferencesStep({ data, onChange }: ReferencesStepProps) {
  const refs = data.references;

  const updateRef = (index: number, patch: Partial<ReferenceEntry>) => {
    const updated = refs.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange({ references: updated });
  };

  const addRef = () => {
    if (refs.length >= MAX_REFERENCES) return;
    onChange({ references: [...refs, emptyRef()] });
  };

  const removeRef = (index: number) => {
    onChange({ references: refs.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-1">References</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Add up to {MAX_REFERENCES} references from previous landlords or employers. This is optional.
      </p>

      <div className="space-y-4">
        {refs.map((ref, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
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
              onChange={(e) => updateRef(i, { name: e.target.value })}
              className="text-sm"
            />
            <Input
              placeholder="Email or phone"
              value={ref.contact}
              onChange={(e) => updateRef(i, { contact: e.target.value })}
              className="text-sm"
            />
            <Input
              placeholder="Relationship (e.g. Previous landlord)"
              value={ref.relationship}
              onChange={(e) => updateRef(i, { relationship: e.target.value })}
              className="text-sm"
            />
          </div>
        ))}

        {refs.length < MAX_REFERENCES && (
          <button
            onClick={addRef}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm font-medium text-muted-foreground hover:border-gray-400 hover:text-foreground transition-colors w-full justify-center"
          >
            <Plus className="h-4 w-4" />
            Add a reference
          </button>
        )}

        {refs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No references added yet. You can skip this step.
          </p>
        )}
      </div>
    </div>
  );
}
