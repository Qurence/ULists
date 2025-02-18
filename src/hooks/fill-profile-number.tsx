import { supabase } from "@/lib/supabase";

const fillProfileNumber = async (userId: string) => {
  try {
    // Проверяем, существует ли уже профиль для этого пользователя
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Если профиль существует и поле number уже заполнено, ничего не делаем
    if (existingProfile && existingProfile.number) {
      console.log("Profile number already exists for user:", userId);
      return;
    }

    // Генерируем случайное число от 4 до 6
    let randomNumber = Math.floor(Math.random() * 3) + 4;
    let uniqueNumber = randomNumber;

    // Проверяем уникальность числа
    while (true) {
      const { data: checkProfile, error: checkError } = await supabase
        .from("profiles")
        .select("number")
        .eq("number", uniqueNumber);

      if (checkError) throw checkError;

      if (!checkProfile || checkProfile.length === 0) break;

      uniqueNumber = Math.floor(Math.random() * 3) + 4;
    }

    // Если профиль не существует, создаем новый
    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          number: uniqueNumber
        });

      if (insertError) throw insertError;
      console.log("New profile created with number:", uniqueNumber);
    } else {
      // Если профиль существует, но number не заполнен, обновляем его
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ number: uniqueNumber })
        .eq("id", userId);

      if (updateError) throw updateError;
      console.log("Profile number updated to:", uniqueNumber);
    }
  } catch (error: any) {
    console.error("Error filling profile number:", error.message);
  }
};

export default fillProfileNumber;