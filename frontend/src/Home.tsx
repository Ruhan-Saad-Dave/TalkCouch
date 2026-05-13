function Home() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Talk Couch!</h1>
            <p className="text-lg text-gray-700 mb-6">
                Your personal space to practice and improve your communication skills.
            </p>
            <p className="mb-4">
                Use the sidebar on the left to navigate through the different practice tools:
            </p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>JAM:</strong> Speak on a topic for a minute without hesitation, repetition, or deviation.</li>
                <li><strong>Jumble:</strong> Unscramble sentences to improve your grammar and sentence structure.</li>
                <li><strong>Speech:</strong> Listen to a sentence and repeat it with correct pronunciation.</li>
                <li><strong>Scenario:</strong> Respond to a real-life situation and explain what you would do.</li>
                <li><strong>Summary:</strong> Listen to a paragraph and explain it in your own words.</li>
            </ul>
            <p className="mt-6">
                Select a tool from the sidebar to start your practice session.
            </p>
        </div>
    );
}

export default Home;
