EXTERNAL changeRelationship(npcId, amount)
EXTERNAL setLearningPath(path)
EXTERNAL startQuest(questId)
EXTERNAL getFlag(key)
EXTERNAL getLearningPath()

VAR global_first_purchase_made = false

-> main

=== main ===
{global_first_purchase_made:
  -> returning_customer
- else:
  -> first_visit
}

=== first_visit ===
أهلاً وسهلاً في دكاني! أنا فاطمة التاجرة.
~ changeRelationship("merchant-fatima", 3)
عندي أجود البضائع من طريق الحرير.
* [ماذا تبيعين؟]
  عندي توابل من الهند، حرير من الصين، وعطور من الحجاز.
  التجارة فن قديم — المساومة جزء منها!
  -> shop_hub
* [أخبريني عن طريق الحرير]
  طريق الحرير ربط الشرق بالغرب لألف سنة.
  التجار العرب كانوا وسطاء بين الحضارات.
  -> shop_hub

=== returning_customer ===
أهلاً بزبوني المفضل! عندي بضاعة جديدة اليوم.
-> shop_hub

=== shop_hub ===
* [أريد أن أشتري]
  تفضل، انظر إلى بضاعتي!
  -> END
* [علميني عن التجارة]
  كلمة سوق — market — من أقدم الكلمات العربية.
  وكلمة تاجر — merchant — من الجذر ت-ج-ر.
  -> END
* [وداعاً]
  مع السلامة! ارجع قريباً.
  -> END
