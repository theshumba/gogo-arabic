EXTERNAL changeRelationship(npcId, amount)
EXTERNAL setLearningPath(path)
EXTERNAL startQuest(questId)
EXTERNAL getFlag(key)
EXTERNAL getLearningPath()

VAR onboarding_complete = false
VAR onboarding_first_word_learned = false
VAR onboarding_mentor_met = false

-> main

=== main ===
{onboarding_complete:
  -> returning_player
- else:
  -> first_meeting
}

=== first_meeting ===
السلام عليكم يا صديقي! أنا أميرة، سأكون مرشدتك.
~ changeRelationship("guide-amira", 5)
أهلاً وسهلاً في عالم اللغة العربية!
* [ما هذا المكان؟]
  هذه واحة المعرفة — مكان آمن لتعلم العربية.
  -> main_hub
* [من أنتِ؟]
  أنا أميرة، عالمة ومرشدة. سأساعدك في رحلتك.
  -> main_hub

=== returning_player ===
عودة ميمونة! ماذا تريد أن نفعل اليوم؟
-> main_hub

=== main_hub ===
* [أريد أن أتعلم]
  تعال، لنبدأ الدرس!
  -> END
* [أخبريني عن هذا المكان]
  هذا المكان يحتوي على كنوز المعرفة العربية.
  -> END
* [وداعاً]
  مع السلامة! سأكون هنا عندما تحتاجني.
  -> END
