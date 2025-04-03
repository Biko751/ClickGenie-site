import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertOfferSchema } from "@shared/schema";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

// Extend the insertOfferSchema with client-side validation
const offerFormSchema = insertOfferSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  link: z.string().url("Please enter a valid URL"),
  network: z.string().min(1, "Please select a network"),
  countries: z.string().min(1, "Please select at least one country"),
  epc: z.number().min(0.01, "EPC must be greater than 0"),
  maxClicksPerDay: z.number().int().min(1, "Must allow at least 1 click per day"),
  description: z.string().optional(),
});

// Remove userId as it will be provided by the server
type OfferFormValues = Omit<z.infer<typeof offerFormSchema>, "userId">;

export default function PostOffer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema.omit({ userId: true })),
    defaultValues: {
      title: "",
      link: "",
      network: "",
      countries: "",
      epc: 0.5,
      maxClicksPerDay: 50,
      description: "",
    },
  });

  // Create the mutation for submitting the offer
  const createOfferMutation = useMutation({
    mutationFn: async (values: OfferFormValues) => {
      const response = await apiRequest("POST", "/api/offers", values);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      
      // Show success toast
      toast({
        title: "Offer Created",
        description: "Your CPA offer has been successfully created and is now active.",
      });
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating offer:", error);
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (values: OfferFormValues) => {
    setIsSubmitting(true);
    try {
      await createOfferMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <PlusCircle className="mr-2 h-5 w-5 text-primary" />
          Post a New CPA Offer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Weight Loss Program" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Link</FormLabel>
                    <FormControl>
                      <Input 
                        type="url" 
                        placeholder="https://your-tracking-link.com" 
                        {...field} 
                        disabled={isSubmitting} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPA Network</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MaxBounty">MaxBounty</SelectItem>
                        <SelectItem value="CPA Grip">CPA Grip</SelectItem>
                        <SelectItem value="PeerFly">PeerFly</SelectItem>
                        <SelectItem value="ClickBank">ClickBank</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Countries" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="EU">Europe</SelectItem>
                        <SelectItem value="Worldwide">Worldwide</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the primary target country for your offer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="epc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earnings Per Click (EPC)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-8"
                          placeholder="0.50"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      How much you'll pay per verified click
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxClicksPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Clicks Per Day</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Limit the number of daily clicks to control spending
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Offer Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Describe your offer and any special instructions..."
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about your offer to increase click-through rates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()} 
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Offer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
