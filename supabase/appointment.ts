// import {supabase }

// export async function bookAppointment({
//     patient_id,
//     doctor_id,
//     slot_number,
//     appointment_time,
// }: {
//     patient_id: string;
//     doctor_id: string;
//     slot_number: number;
//     appointment_time: string;
// }) {
//     const { data, error } = await supabase
//         .from("appointments")
//         .insert([
//             {
//                 patient_id,
//                 doctor_id,
//                 slot_number,
//                 appointment_time,
//             },
//         ])
//         .select();

//     if (error) {
//         console.error("Booking error:", error);
//         throw error;
//     }

//     return data;
// }