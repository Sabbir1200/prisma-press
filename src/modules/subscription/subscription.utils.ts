import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

export  const getPeriodEnd = (payload : Stripe.Subscription)=>{
    const currentPeriodEndInMilliSeconds = payload.items.data[0]?.current_period_end!;
      const currentPeriodEnd = new Date(currentPeriodEndInMilliSeconds * 1000);

      return currentPeriodEnd;
}

export const handleCheckoutCompleted = async(session : Stripe.Checkout.Session)=>{
      
      const userId = session.metadata?.userId as string ;
      const stripeCustomerId = session.customer as string;
      const stripeSubscriptionId = session.subscription as string;
      
      if(userId || stripeCustomerId || stripeSubscriptionId){
        console.log("webhook :  Missing values For Creating Checkout Session");
        return ;
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      const currentPeriodStart = stripeSubscription.items.data[0]?.current_period_start;
      const currentPeriodEnd = getPeriodEnd(stripeSubscription)

      await prisma.subscription.upsert({
        where : {
              userId 
        },
        create :{
              userId,
              stripeCustomerId,
              stripeSubscriptionId,
              status: "ACTIVE",
              currentPeriodEnd
        },
        update :{
          stripeCustomerId,
          stripeSubscriptionId,
          status: "ACTIVE",
          currentPeriodEnd
        }
      })
}


export  const handleChangeSubscription = async(payload : Stripe.Subscription) =>{

  const stripeSubscriptionId = payload.id;
  const status = payload.status === "active" ? SubscriptionStatus.ACTIVE :
  payload.status === "trialing" ? SubscriptionStatus.ACTIVE :
  payload.status === "canceled" ? SubscriptionStatus.CANCELED : SubscriptionStatus.EXPIRED

  const currentPeriodEnd = getPeriodEnd(payload)

  const isSubscriptionExist = await prisma.subscription.findUnique({
    where : {
      stripeSubscriptionId
    }
  })
  if(!isSubscriptionExist){
    console.log(`Webhook : No Subscription found for subscription id : ${stripeSubscriptionId}`);

    return;
  }
  await prisma.subscription.update({
    where : {
      stripeSubscriptionId
    },
    data :{
      status,
      currentPeriodEnd
    }
  })
}
