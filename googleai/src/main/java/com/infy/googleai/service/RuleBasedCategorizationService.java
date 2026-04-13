package com.infy.googleai.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Rule-based transaction categorizer.
 *
 * <p>Matches the transaction description against keyword lists for each
 * category.  Returns {@code null} when no rule matches, signalling the
 * caller to fall through to the Gemini AI model.
 */
@Service
public class RuleBasedCategorizationService {

    /**
     * Category keyword rules.
     *
     * <p>Order matters: the first matching category wins.  Place more
     * specific / higher-priority categories before broader ones.
     *
     * <p>All keywords are stored in lower-case; matching is performed
     * case-insensitively.
     */
    private static final Map<String, List<String>> CATEGORY_RULES =
            new LinkedHashMap<>() {{

                put("GROCERIES", List.of(
                        "grocery", "groceries", "supermarket", "walmart", "target",
                        "whole foods", "trader joe", "safeway", "kroger", "aldi",
                        "costco", "blinkit", "zepto", "bigbasket", "dmart",
                        "reliance fresh", "more supermarket", "spencers", "fresh",
                        "market", "vegetables", "fruits", "kirana"
                ));

                put("RENT", List.of(
                        "rent", "lease", "landlord", "housing", "apartment",
                        "flat rent", "pg rent", "room rent", "monthly rent",
                        "house rent", "rental"
                ));

                put("UTILITIES", List.of(
                        "electricity", "electric bill", "power bill", "water bill",
                        "gas bill", "internet", "broadband", "wifi", "telephone",
                        "mobile bill", "phone bill", "recharge", "dth", "cable",
                        "utility", "bsnl", "airtel", "jio", "vi",
                        "vodafone", "idea", "EB bill", "TNEB", "bescom"
                ));

                put("FOOD", List.of(
                        "restaurant", "cafe", "coffee", "pizza", "burger",
                        "swiggy", "zomato", "dunzo", "dominos", "mcdonald",
                        "kfc", "subway", "starbucks", "haldirams", "barbeque",
                        "biryani", "dhaba", "hotel", "snack", "lunch", "dinner",
                        "breakfast", "food", "eat", "meal", "dine", "takeaway",
                        "takeout", "delivery food", "canteen", "mess"
                ));

                put("ENTERTAINMENT", List.of(
                        "netflix", "amazon prime", "hotstar", "disney", "spotify",
                        "youtube premium", "apple music", "zee5", "sonyliv",
                        "movie", "cinema", "theatre", "concert", "event",
                        "gaming", "steam", "playstation", "xbox", "ticket",
                        "entertainment", "subscription", "streaming", "bookmyshow",
                        "pvr", "inox", "amusement", "park"
                ));

                put("TRANSPORTATION", List.of(
                        "uber", "ola", "rapido", "auto", "cab", "taxi",
                        "metro", "bus", "train", "irctc", "railway", "fuel",
                        "petrol", "diesel", "cng", "toll", "parking",
                        "transport", "commute", "flight", "airways", "indigo",
                        "air india", "spicejet", "goair", "vistara",
                        "bike service", "car service", "vehicle"
                ));

                put("HEALTHCARE", List.of(
                        "hospital", "clinic", "doctor", "physician", "medical",
                        "medicine", "pharmacy", "chemist", "apollo", "fortis",
                        "max hospital", "aiims", "diagnostic", "lab test",
                        "blood test", "x-ray", "scan", "health", "dental",
                        "dentist", "optician", "eye care", "insurance premium",
                        "health insurance", "1mg", "netmeds", "pharmeasy"
                ));

                put("SHOPPING", List.of(
                        "amazon", "flipkart", "myntra", "ajio", "meesho",
                        "nykaa", "snapdeal", "shopclues", "ebay", "zara",
                        "h&m", "lifestyle", "pantaloons", "westside",
                        "shopping", "purchase", "buy", "order", "clothes",
                        "shoes", "fashion", "accessories", "electronics",
                        "gadget", "mobile", "laptop", "appliance"
                ));

                put("TRAVEL", List.of(
                        "hotel booking", "resort", "hostel", "airbnb", "oyo",
                        "makemytrip", "yatra", "goibibo", "cleartrip",
                        "travel", "trip", "holiday", "vacation", "tour",
                        "sightseeing", "tourism", "visa", "passport",
                        "luggage", "baggage", "itinerary"
                ));

                put("MONEY_TRANSFER", List.of(
                        "transfer", "wire", "payment to", "receive from", "upi",
                        "paytm", "gpay", "phonepe", "amazon pay", "wallet",
                        "bank transfer", "neft", "rtgs", "imps", "cash",
                        "sent to", "paid to"
                ));

                put("BILL_PAYMENTS", List.of(
                        "bill payment", "credit card bill", "recharge", "postpaid",
                        "insurance", "policy", "premium", "tax", "gst",
                        "municipal", "challan"
                ));

                put("METRO_RECHARGE", List.of(
                        "metro", "metro card", "smart card", "dmrc", "bmrc",
                        "mmrc", "metro recharge", "subway card"
                ));
            }};

    /**
     * Tries to categorize the transaction using keyword rules.
     *
     * @param description the transaction description
     * @param merchantName the merchant name
     * @return the matched category name (upper-case), or {@code null} if no rule matches
     */
    public String categorize(String description, String merchantName) {
        String combined = (
                (merchantName != null ? merchantName : "") + " " +
                (description != null ? description : "")
        ).toLowerCase().trim();

        if (combined.isEmpty()) {
            return "MISCELLANEOUS";
        }

        for (Map.Entry<String, List<String>> entry : CATEGORY_RULES.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (combined.contains(keyword.toLowerCase())) {
                    return entry.getKey();
                }
            }
        }

        return null;
    }
}

