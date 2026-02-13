"use server";

import { review, user } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ReviewWithUser = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  } | null;
};

export async function getReviews(productId: string) {
  try {
    const reviews = await db
      .select({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          name: user.name,
          image: user.image,
        },
      })
      .from(review)
      .leftJoin(user, eq(review.userId, user.id))
      .where(eq(review.productId, productId))
      .orderBy(desc(review.createdAt));

    const [agg] = await db
      .select({
        avgRating: sql<number>`avg(${review.rating})`,
        count: sql<number>`count(*)`,
      })
      .from(review)
      .where(eq(review.productId, productId));

    return {
      reviews,
      averageRating: agg?.avgRating ? Number(agg.avgRating) : 0,
      totalReviews: agg?.count ? Number(agg.count) : 0,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
    };
  }
}

export async function submitReview({
  productId,
  rating,
  comment,
}: {
  productId: string;
  rating: number;
  comment: string;
}) {
  try {
    // 1. Authenticate server-side — do NOT trust client-provided userId
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return {
        success: false,
        error: "Vous devez être connecté pour laisser un avis",
      };
    }

    const userId = authUser.id;

    // 2. Ensure user exists in local DB
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(user).values({
        id: userId,
        name:
          authUser.user_metadata?.full_name || authUser.email || "Utilisateur",
        email: authUser.email!,
        emailVerified: true,
        image: authUser.user_metadata?.avatar_url || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 3. Check if review exists
    const existingReview = await db
      .select()
      .from(review)
      .where(and(eq(review.productId, productId), eq(review.userId, userId)))
      .limit(1);

    if (existingReview.length > 0) {
      // Update existing
      await db
        .update(review)
        .set({
          rating,
          comment,
          createdAt: new Date(),
        })
        .where(eq(review.id, existingReview[0].id));
    } else {
      // Create new
      await db.insert(review).values({
        id: crypto.randomUUID(),
        productId,
        userId,
        rating,
        comment,
        createdAt: new Date(),
      });
    }

    revalidatePath(`/produits/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}
