export default function About() {
  return (
    <div className="flex-1 bg-secondary">
      <div className="max-w-[1600px] mx-auto px-4 py-12 pt-24">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">About</h1>
        </div>

        {/* Project Overview Section */}
        <div className="max-w-[600px] mx-auto bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            OpenFlights Data Explorer is a student project I completed for my data structures & algorithms class.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            This website retrieves airport, airline and aviation route data from a backend service and displays it via a user-friendly graphical interface.
            My time and effort was largely spent planning how to prompt the AI (Claude Sonnet 4.5) to build the codebase in one (actually two) shots - a directive
            which it followed nicely. There were few outright bugs, and all of them were quickly resolved. Most of my subsequent prompts were focused on experimenting
            with slightly different UI components to change how the user interacts with the website.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            View the source code here: https://github.com/Mordritz/openflights-website
          </p>
          <p className="text-gray-700 leading-relaxed">
            Thank you to openflights.org for making the dataset readily accessible to the public.
          </p>
        </div>

        {/* Contact/Footer Section */}
        <div className="max-w-[600px] mx-auto bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold mb-4">About Me</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            I'm a product manager and hobbyist game developer who discovered his passion for programming just in time (c.a. 2022) to watch language models
            unleash havoc on the discipline. In my experience I have found them quite useful as a resource.
          </p>
          <p className="text-gray-700 leading-relaxed">
            I have a wide range of interests which you can learn more about here!
            [TO-DO]: link to my personal blog once it is back up.
          </p>
        </div>
      </div>
    </div>
  );
}