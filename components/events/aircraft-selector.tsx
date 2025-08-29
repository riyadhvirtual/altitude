'use client';

import { Check, Search, X } from 'lucide-react';
import { memo, useCallback, useDeferredValue, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type Aircraft } from '@/db/schema';

interface AircraftSelectorProps {
  aircraft: Aircraft[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  errorMessage?: string;
}

export function AircraftSelector({
  aircraft,
  selectedIds,
  onChange,
  errorMessage,
}: AircraftSelectorProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const idToAircraft = useMemo(() => {
    const map = new Map<string, Aircraft>();
    for (const ac of aircraft) {
      map.set(ac.id, ac);
    }
    return map;
  }, [aircraft]);

  const filtered = useMemo(() => {
    const s = deferredQuery.trim().toLowerCase();
    if (!s) {
      return aircraft;
    }
    return aircraft.filter(
      (ac) =>
        ac.name.toLowerCase().includes(s) || ac.livery.toLowerCase().includes(s)
    );
  }, [aircraft, deferredQuery]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const an = a.name.localeCompare(b.name);
      return an !== 0 ? an : a.livery.localeCompare(b.livery);
    });
  }, [filtered]);

  const unselected = useMemo(
    () => sortedFiltered.filter((ac) => !selectedIds.includes(ac.id)),
    [sortedFiltered, selectedIds]
  );

  const toggle = useCallback(
    (id: string) => {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id];
      onChange(next);
    },
    [onChange, selectedIds]
  );

  return (
    <FormItem>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Aircraft *</h2>
      </div>

      {aircraft.length === 0 ? (
        <div className="mt-1 flex items-center justify-center rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
          No aircraft in fleet. Add aircraft before creating events.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search aircraft by name or livery..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                aria-label="Search aircraft"
              />
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const ac = idToAircraft.get(id);
                return ac ? (
                  <Badge key={id} variant="secondary" className="gap-1 group">
                    {ac.name} - {ac.livery}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0 hover:bg-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(id);
                      }}
                      aria-label={`Remove ${ac.name} ${ac.livery}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}

          <div className="max-h-56 overflow-y-auto rounded-md border border-border bg-background">
            {unselected.length > 0 ? (
              <ul>
                {unselected.map((ac) => (
                  <li
                    key={ac.id}
                    className="flex items-center gap-2 p-2 text-sm hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggle(ac.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle(ac.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${ac.name} ${ac.livery}`}
                  >
                    <Checkbox
                      checked={selectedIds.includes(ac.id)}
                      onCheckedChange={() => toggle(ac.id)}
                      id={ac.id}
                      aria-describedby={`${ac.id}-label`}
                    />
                    <span id={`${ac.id}-label`} className="flex-1">
                      {ac.name} - {ac.livery}
                    </span>
                    {selectedIds.includes(ac.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-center text-sm text-muted-foreground">
                {query
                  ? `No aircraft found matching "${query}"`
                  : 'All aircraft selected'}
              </div>
            )}
          </div>
          <FormMessage className="text-xs mt-1">{errorMessage}</FormMessage>
        </div>
      )}
    </FormItem>
  );
}

export default memo(AircraftSelector);
