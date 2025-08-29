'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createAirlineAction } from '@/actions/setup/create-airline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const airlineCreationSchema = z
  .object({
    name: z.string().min(1, 'Airline name is required'),
    callsign: z.string().min(1, 'Callsign is required'),
    callsignMinRange: z.number().min(1).max(999999),
    callsignMaxRange: z.number().min(1).max(999999),
  })
  .refine((data) => data.callsignMinRange <= data.callsignMaxRange, {
    message: 'Minimum range must be less than or equal to maximum range',
    path: ['callsignMinRange'],
  });

type AirlineCreationFormData = z.infer<typeof airlineCreationSchema>;

interface AirlineCreationProps {
  onComplete: () => void;
}

export default function AirlineCreation({ onComplete }: AirlineCreationProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callsignRange, setCallsignRange] = useState([1, 999]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AirlineCreationFormData>({
    resolver: zodResolver(airlineCreationSchema),
    defaultValues: {
      name: '',
      callsign: '',
      callsignMinRange: 1,
      callsignMaxRange: 999,
    },
  });

  const onSubmit = async (data: AirlineCreationFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await createAirlineAction({
        name: data.name,
        callsign: data.callsign,
        callsignMinRange: data.callsignMinRange,
        callsignMaxRange: data.callsignMaxRange,
      });

      if (result?.data?.success) {
        onComplete();
      } else {
        setErrorMessage('Failed to create airline');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setCallsignRange(value);
    setValue('callsignMinRange', value[0]);
    setValue('callsignMaxRange', value[1]);
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h2 className="font-bold text-2xl text-foreground">
          Create Your Airline
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Set up your virtual airline details
        </p>
      </div>

      <form
        className="space-y-6 text-foreground"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
          <Input
            disabled={isLoading}
            id="name"
            placeholder="Air France Virtual"
            type="text"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-center text-destructive text-sm">
              {errors.name.message}
            </p>
          )}

          <Input
            disabled={isLoading}
            id="callsign"
            placeholder="AFVA"
            type="text"
            {...register('callsign')}
          />
          {errors.callsign && (
            <p className="text-center text-destructive text-sm">
              {errors.callsign.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pilot Callsign Range</Label>
            <p className="text-xs text-muted-foreground">
              Set the numeric range available for pilot callsigns. Staff members
              with any role aren’t restricted by this range. You can modify this
              later in the settings.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="min-range"
                  className="text-xs text-muted-foreground"
                >
                  From
                </Label>
                <Input
                  id="min-range"
                  type="number"
                  min="1"
                  max="9999"
                  disabled={isLoading}
                  value={callsignRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const newRange = [
                      Math.min(value, callsignRange[1]),
                      callsignRange[1],
                    ];
                    setCallsignRange(newRange);
                    setValue('callsignMinRange', newRange[0]);
                    setValue('callsignMaxRange', newRange[1]);
                  }}
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="max-range"
                  className="text-xs text-muted-foreground"
                >
                  To
                </Label>
                <Input
                  id="max-range"
                  type="number"
                  min="1"
                  max="9999"
                  disabled={isLoading}
                  value={callsignRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 999;
                    const newRange = [
                      callsignRange[0],
                      Math.max(value, callsignRange[0]),
                    ];
                    setCallsignRange(newRange);
                    setValue('callsignMinRange', newRange[0]);
                    setValue('callsignMaxRange', newRange[1]);
                  }}
                  className="text-center"
                />
              </div>
            </div>

            <div className="px-2 py-2">
              <Slider
                value={callsignRange}
                onValueChange={handleSliderChange}
                min={1}
                max={9999}
                step={1}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="text-center text-xs text-muted-foreground">
              {callsignRange[1] - callsignRange[0] + 1} available callsigns
            </div>
          </div>

          {errors.callsignMinRange && (
            <p className="text-center text-destructive text-sm">
              {errors.callsignMinRange.message}
            </p>
          )}
        </div>

        {errorMessage && (
          <p className="text-center text-destructive text-sm">{errorMessage}</p>
        )}

        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? 'Creating Airline...' : 'Complete Setup'}
        </Button>
      </form>
    </div>
  );
}
