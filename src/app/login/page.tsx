import LoginForm from "@/components/form/LoginForm";

export default function Signup() {
  return (
    <div className="h-screen flex justify-center items-center bg-base-200 text-[#ebebeb]">
      <div className="w-80 flex flex-col text-center gap-6 sm:w-96">
        <div className="cursor-default font-bold text-3xl">
          <h1>Honoria</h1>
        </div>
        <LoginForm />
        <div className="cursor-default text-xs">
          <p>Think only about your art.</p>
        </div>
      </div>
    </div>
  )
}
