"use client";

import { useState, useRef } from "react";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Pencil, CheckCircle2, ImagePlus, X, Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId?: number;
  productName?: string;
  onReviewSubmitted?: () => void;
  className?: string;
}

export function ReviewForm({
  productId,
  productName,
  onReviewSubmitted,
  className,
}: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setRating(0);
    setContent("");
    setAuthorName("");
    setAuthorEmail("");
    setImages([]);
    setError(null);
    setSuccess(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "reviews" }),
      });

      if (!signRes.ok) throw new Error("Failed to get upload signature");

      const { cloudName, apiKey, timestamp, signature } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", "reviews");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Failed to upload image");

      const data = await uploadRes.json();
      const secureUrl = data.secure_url;

      // Validate that the URL is from Cloudinary
      if (!secureUrl || !secureUrl.includes("cloudinary.com")) {
        console.error("Invalid upload response - not a Cloudinary URL");
        return null;
      }

      return secureUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }

    setIsUploading(true);
    setError(null);

    const uploadPromises: Promise<string | null>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        continue;
      }
      uploadPromises.push(uploadImage(file));
    }

    const results = await Promise.all(uploadPromises);
    const successfulUrls = results.filter((url): url is string => url !== null);

    setImages((prev) => [...prev, ...successfulUrls]);
    setIsUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }
    if (!authorName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(productId && { productId }),
          rating,
          content: content.trim() || undefined,
          images: images.length > 0 ? images : undefined,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
          verified: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);

      // Call callback after short delay
      setTimeout(() => {
        onReviewSubmitted?.();
        resetForm();
        setOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = [
    "",
    "Poor - Did not meet expectations",
    "Fair - Below average",
    "Good - Met expectations",
    "Very Good - Above average",
    "Excellent - Exceeded expectations",
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Pencil className="w-4 h-4" />
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            {productName
              ? `Share your experience with ${productName}`
              : "Share your experience shopping with KicksHub"}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Thank you for your review!
            </h3>
            <p className="text-muted-foreground">
              Your feedback helps other customers make better decisions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Overall Rating <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <StarRating
                  rating={rating}
                  size="lg"
                  interactive
                  onChange={setRating}
                />
                {rating > 0 && (
                  <span className="text-sm text-muted-foreground animate-in fade-in">
                    {ratingLabels[rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Images (Optional) */}
            <div className="space-y-2">
              <Label>Add Photos (Optional - Max 5)</Label>
              <div className="flex flex-wrap gap-2">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Review image ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-16 h-16 border-2 border-dashed rounded-md flex items-center justify-center hover:border-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Each image must be less than 5MB
              </p>
            </div>

            {/* Content (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="review-content">Your Review (Optional)</Label>
              <Textarea
                id="review-content"
                placeholder="What did you like or dislike about this product? How was the quality and comfort?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                maxLength={2000}
              />
              {content.length > 0 && (
                <div className="text-xs text-muted-foreground text-right">
                  {content.length}/2000 characters
                </div>
              )}
            </div>

            {/* Author Name */}
            <div className="space-y-2">
              <Label htmlFor="author-name">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author-name"
                placeholder="Enter your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            {/* Author Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="author-email">Email (Optional)</Label>
              <Input
                id="author-email"
                type="email"
                placeholder="your@email.com"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your email won't be displayed publicly
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
