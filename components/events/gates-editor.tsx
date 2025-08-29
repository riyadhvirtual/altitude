'use client';

import { Check, X } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface GatesEditorProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  errorMessage?: string;
}

function normalizeGate(input: string) {
  return input.replace(/\s+/g, ' ').trim().toUpperCase();
}

function parseGateBatch(input: string) {
  return input
    .split(/[, \n\r\t]+/)
    .map(normalizeGate)
    .filter((g) => g.length > 0);
}

export function GatesEditor({
  label,
  placeholder,
  values,
  onChange,
  errorMessage,
}: GatesEditorProps) {
  const [gateInput, setGateInput] = useState('');

  const valueSet = useMemo(
    () => new Set(values.map((g) => g.toUpperCase())),
    [values]
  );

  const addGates = useCallback(
    (raw: string) => {
      const add = parseGateBatch(raw);
      if (add.length === 0) {
        return;
      }
      const merged = [...values];
      const set = new Set(valueSet);
      for (const g of add) {
        if (!set.has(g)) {
          merged.push(g);
          set.add(g);
        }
      }
      onChange(merged);
    },
    [onChange, valueSet, values]
  );

  const removeGate = useCallback(
    (gate: string) => {
      const next = values.filter((g) => g.toUpperCase() !== gate.toUpperCase());
      onChange(next);
    },
    [onChange, values]
  );

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium">{label}</FormLabel>
      <div className="space-y-2">
        <div className="relative h-9">
          <Input
            placeholder={placeholder}
            value={gateInput}
            onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (gateInput.trim()) {
                  addGates(gateInput);
                  setGateInput('');
                }
              }
            }}
            className="pr-8 h-9 text-sm"
          />
          {gateInput.trim() && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0"
              onClick={() => {
                if (gateInput.trim()) {
                  addGates(gateInput);
                  setGateInput('');
                }
              }}
              aria-label="Add gate"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="min-h-[60px] max-h-24 overflow-y-auto rounded-md p-2">
          {values.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {values.map((gate) => (
                <Badge
                  key={gate}
                  variant="secondary"
                  className="gap-1 group hover:bg-secondary/80 transition-colors flex-shrink-0 h-6 text-xs px-2"
                >
                  <span className="font-medium">{gate}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-destructive/20 hover:text-destructive transition-colors"
                    onClick={() => removeGate(gate)}
                    aria-label={`Remove ${gate}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="h-[44px] flex items-center justify-center text-xs text-muted-foreground">
              No gates added yet
            </div>
          )}
        </div>
      </div>
      {errorMessage ? (
        <FormMessage className="text-xs mt-1">{errorMessage}</FormMessage>
      ) : null}
    </FormItem>
  );
}

export default memo(GatesEditor);
