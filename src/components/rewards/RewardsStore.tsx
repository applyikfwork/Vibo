'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { STORE_ITEMS_CATALOG } from '@/lib/rewards/constants';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function RewardsStore() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (itemId: string, currency: 'coins' | 'gems') => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'Please log in to make purchases',
      });
      return;
    }

    setIsPurchasing(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/rewards/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ itemId, currency }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Purchase Successful! 🎉',
          description: `You purchased ${data.purchasedItem}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Purchase Failed',
          description: data.error || 'Could not complete purchase',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process purchase',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderStoreItem = (item: any) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-3xl">{item.icon}</span>
              {item.name}
            </CardTitle>
            <CardDescription className="mt-2">{item.description}</CardDescription>
          </div>
          {item.rarity && (
            <Badge variant={item.rarity === 'legendary' ? 'default' : 'secondary'}>
              {item.rarity}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {item.price && (
              <div className="flex items-center gap-1">
                <span className="text-2xl">🪙</span>
                <span className="font-bold">{item.price}</span>
              </div>
            )}
            {item.gemPrice && (
              <div className="flex items-center gap-1">
                <span className="text-2xl">💎</span>
                <span className="font-bold">{item.gemPrice}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {item.price && (
              <Button
                onClick={() => handlePurchase(item.id, 'coins')}
                disabled={isPurchasing}
                size="sm"
              >
                Buy with Coins
              </Button>
            )}
            {item.gemPrice && (
              <Button
                onClick={() => handlePurchase(item.id, 'gems')}
                disabled={isPurchasing}
                variant="outline"
                size="sm"
              >
                Buy with Gems
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Rewards Store
        </h1>
        <p className="text-muted-foreground mt-2">
          Spend your coins and gems on exclusive items and boosts
        </p>
      </div>

      <Tabs defaultValue="boosts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="boosts">Boosts</TabsTrigger>
          <TabsTrigger value="frames">Profile Frames</TabsTrigger>
          <TabsTrigger value="cosmetics">Cosmetics</TabsTrigger>
          <TabsTrigger value="gifts">Gifts</TabsTrigger>
        </TabsList>

        <TabsContent value="boosts" className="space-y-4">
          {STORE_ITEMS_CATALOG.boosts.map(renderStoreItem)}
        </TabsContent>

        <TabsContent value="frames" className="space-y-4">
          {STORE_ITEMS_CATALOG.profileFrames.map(renderStoreItem)}
        </TabsContent>

        <TabsContent value="cosmetics" className="space-y-4">
          {STORE_ITEMS_CATALOG.cosmetics.map(renderStoreItem)}
        </TabsContent>

        <TabsContent value="gifts" className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              Send gifts to other users to show your appreciation. They'll receive rewards and you'll earn giver points!
            </p>
          </div>
          {STORE_ITEMS_CATALOG.gifts.map(renderStoreItem)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
