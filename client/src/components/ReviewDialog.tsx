import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageSquare, Heart, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dealClaimId: number;
  dealTitle: string;
  vendorName: string;
  dealId: number;
  vendorId: number;
  onReviewSubmitted?: () => void;
}

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, label, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={`p-1 transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            onClick={() => !disabled && onRatingChange(star)}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating}/5` : 'No rating'}
        </span>
      </div>
    </div>
  );
};

export default function ReviewDialog({
  isOpen,
  onClose,
  dealClaimId,
  dealTitle,
  vendorName,
  dealId,
  vendorId,
  onReviewSubmitted
}: ReviewDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Deal rating state
  const [dealQualityRating, setDealQualityRating] = useState(0);
  const [valueForMoneyRating, setValueForMoneyRating] = useState(0);
  const [dealAccuracyRating, setDealAccuracyRating] = useState(0);

  // Vendor rating state
  const [vendorServiceRating, setVendorServiceRating] = useState(0);
  const [vendorResponseRating, setVendorResponseRating] = useState(0);
  const [vendorProfessionalismRating, setVendorProfessionalismRating] = useState(0);

  // Overall experience
  const [overallRating, setOverallRating] = useState(0);

  // Written feedback
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const resetForm = () => {
    setDealQualityRating(0);
    setValueForMoneyRating(0);
    setDealAccuracyRating(0);
    setVendorServiceRating(0);
    setVendorResponseRating(0);
    setVendorProfessionalismRating(0);
    setOverallRating(0);
    setReviewTitle('');
    setReviewText('');
    setPros('');
    setCons('');
    setWouldRecommend(true);
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceedToStep2 = () => {
    return dealQualityRating > 0 && valueForMoneyRating > 0 && dealAccuracyRating > 0;
  };

  const canProceedToStep3 = () => {
    return vendorServiceRating > 0 && vendorResponseRating > 0 && vendorProfessionalismRating > 0;
  };

  const canSubmitReview = () => {
    return overallRating > 0 && reviewTitle.trim().length > 0;
  };

  const handleSubmitReview = async () => {
    if (!canSubmitReview()) {
      toast({
        title: "Incomplete Review",
        description: "Please provide an overall rating and review title before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        dealClaimId,
        dealId,
        vendorId,
        dealQualityRating,
        valueForMoneyRating,
        dealAccuracyRating,
        vendorServiceRating,
        vendorResponseRating,
        vendorProfessionalismRating,
        overallRating,
        reviewTitle: reviewTitle.trim(),
        reviewText: reviewText.trim() || null,
        pros: pros.trim() || null,
        cons: cons.trim() || null,
        wouldRecommend,
      };

      await apiRequest('/api/reviews', 'POST', reviewData);

      toast({
        title: "Review Submitted Successfully!",
        description: "Thank you for your feedback. Your review helps other customers make better decisions.",
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      handleClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === currentStep
                ? 'bg-blue-600 text-white'
                : step < currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-muted-foreground'
            }`}
          >
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-1 mx-2 transition-colors ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2 text-blue-600" />
          Rate the Deal Quality
        </CardTitle>
        <p className="text-sm text-muted-foreground">How was your experience with "{dealTitle}"?</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <StarRating
          rating={dealQualityRating}
          onRatingChange={setDealQualityRating}
          label="Deal Quality - How satisfied are you with the product/service?"
        />
        <StarRating
          rating={valueForMoneyRating}
          onRatingChange={setValueForMoneyRating}
          label="Value for Money - Was it worth the price you paid?"
        />
        <StarRating
          rating={dealAccuracyRating}
          onRatingChange={setDealAccuracyRating}
          label="Description Accuracy - Did the deal match what was advertised?"
        />
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-600" />
          Rate the Vendor Service
        </CardTitle>
        <p className="text-sm text-muted-foreground">How was your experience with {vendorName}?</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <StarRating
          rating={vendorServiceRating}
          onRatingChange={setVendorServiceRating}
          label="Service Quality - How was the customer service?"
        />
        <StarRating
          rating={vendorResponseRating}
          onRatingChange={setVendorResponseRating}
          label="Response Time - How quickly did they respond to your needs?"
        />
        <StarRating
          rating={vendorProfessionalismRating}
          onRatingChange={setVendorProfessionalismRating}
          label="Professionalism - How professional was their behavior?"
        />
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Overall Experience & Written Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <StarRating
            rating={overallRating}
            onRatingChange={setOverallRating}
            label="Overall Rating - How would you rate your complete experience?"
          />

          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title *</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience in one line"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{reviewTitle.length}/100 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-text">Detailed Review (Optional)</Label>
            <Textarea
              id="review-text"
              placeholder="Share more details about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{reviewText.length}/500 characters</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pros">What did you like? (Optional)</Label>
              <Textarea
                id="pros"
                placeholder="List the positive aspects..."
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cons">What could be improved? (Optional)</Label>
              <Textarea
                id="cons"
                placeholder="Suggest improvements..."
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recommend"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Label htmlFor="recommend" className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              I would recommend this deal to others
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Share Your Experience</DialogTitle>
          <DialogDescription className="text-center">
            Your feedback helps other customers and improves our service quality
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                handleClose();
              }
            }}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Skip Review
            </Button>
            
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedToStep2()) ||
                  (currentStep === 2 && !canProceedToStep3())
                }
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmitReview}
                disabled={!canSubmitReview() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}