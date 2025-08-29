'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createLeaveRequestAction } from '@/actions/leave/create-leave-request';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const leaveRequestFormSchema = z
  .object({
    reason: z
      .string()
      .min(10, 'Reason must be at least 10 characters.')
      .max(200, 'Reason must be less than 200 characters.'),
    startDate: z.date({
      message: 'Please select a start date.',
    }),
    endDate: z.date({
      message: 'Please select an end date.',
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date.',
    path: ['endDate'],
  });

type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>;

export function LeaveRequestForm() {
  const router = useRouter();

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      reason: '',
    },
  });

  const { execute, isPending } = useAction(createLeaveRequestAction, {
    onSuccess: () => {
      toast.success('Leave request submitted successfully!');
      router.push('/leave');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.error.serverError || 'Failed to submit leave request');
    },
  });

  function onSubmit(data: LeaveRequestFormValues) {
    execute({
      reason: data.reason,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8 text-foreground"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center">
                  <CalendarIcon className="h-4 w-4" />
                  Start Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        variant={'outline'}
                      >
                        {field.value ? (
                          new Date(field.value).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        ) : (
                          <span>Pick a start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto border-0 p-0">
                    <Calendar
                      mode="single"
                      onSelect={field.onChange}
                      selected={field.value}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center">
                  <CalendarIcon className="h-4 w-4" />
                  End Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        variant={'outline'}
                      >
                        {field.value ? (
                          new Date(field.value).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto border-0 p-0">
                    <Calendar
                      mode="single"
                      onSelect={field.onChange}
                      selected={field.value}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center">
                    <MessageSquare className="h-4 w-4" />
                    Reason for Leave
                  </FormLabel>
                  <span className="text-xs text-muted-foreground">
                    {field.value?.length || 0} / 200
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    className="h-32 resize-none"
                    placeholder="Please describe the reason for your leave request in detail..."
                    {...field}
                    maxLength={200}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2">
          <Button disabled={isPending} type="submit">
            {isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
