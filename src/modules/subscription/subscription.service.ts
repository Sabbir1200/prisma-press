import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../../generated/prisma/enums";
import { handleChangeSubscription, handleCheckoutCompleted } from "./subscription.utils";

const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });
    // old subscribe
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
        // new subscribe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
        line_items : [
            {
                price: config.stripe_product_id,
                quantity : 1
            }
        ],
        mode: "subscription",
        customer : stripeCustomerId,
        payment_method_types : ["card"],
        success_url: `${config.app_url}/premium?success=true`,
        cancel_url : `${config.app_url}/payment?success=false`,
        metadata : {userId : user.id}
    })
    return session.url
  });

  return {
    paymentUrl : transactionResult
  };
};


const handleWebhook = async(payload : Buffer, signature : string)=>{

  const endpointSecret = config.stripe_webhook_secret
  const event = stripe.webhooks.constructEvent(
        payload,
        signature ,
        endpointSecret
      );


        switch (event.type) {
    case 'checkout.session.completed':
      // const paymentObject = event.data.object;
      
      await handleCheckoutCompleted(event.data.object)
      break;
    case 'customer.subscription.updated':
      // const paymentObject = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
       await handleChangeSubscription(event.data.object)
      break;
      case 'customer.subscription.deleted':
        // const paymentObject = event.data.object;

        await handleChangeSubscription(event.data.object)

        break;

    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }

}

const getSubscriptionStatus = async(userId : string)=>{

  const isSubscriptionExist = await prisma.subscription.findFirstOrThrow({
    where:{
      userId
    }
  });
  const isActive = isSubscriptionExist.status === "ACTIVE" && isSubscriptionExist.currentPeriodEnd && new Date(isSubscriptionExist.currentPeriodEnd) > new Date ();

  return {
    status : isSubscriptionExist,
    isSubscribed : isActive,
    currentPeriodEnd : isSubscriptionExist.currentPeriodEnd
  }
}


export const subscriptionServices = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus
};
